"""
Extrai texturas do V Rising (Unity) e gera WebP otimizados para o wiki.
Retoma de onde parou via progress.json + manifest.json.

Uso: python scripts/extract-vrising-assets.py
"""
from __future__ import annotations

import json
import re
import sys
from io import BytesIO
from pathlib import Path

import UnityPy
from PIL import Image

GAME_ROOT = Path(r"D:\SteamLibrary\steamapps\common\VRising\VRising_Data")
PROJECT_ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = PROJECT_ROOT / "client" / "public" / "assets" / "game"
MANIFEST_PATH = OUT_DIR / "manifest.json"
PROGRESS_PATH = OUT_DIR / "progress.json"

EXCLUDE_NAME = re.compile(
    r"^(Tex_Mask|Tex_Trail|Tex_Noise|Tex_Smoke|Tex_Fire|Tex_Water|"
    r"Tex_Gradient|Tex_Dust|Tex_Blob|Tex_Spark|Tex_Lightning|Tex_Shockwave|"
    r"Tex_Ring|Tex_Slash|Tex_Impact|Tex_Decal)",
    re.I,
)

MAX_EDGE = 1024
WEBP_QUALITY = 78
WEBP_METHOD = 6
CHECKPOINT_EVERY = 25


def log(msg: str) -> None:
    print(msg, flush=True)


def sanitize(name: str) -> str:
    s = re.sub(r"[^\w.\-]+", "_", name.strip())
    return s[:180] or "unnamed"


def source_id(path: Path) -> str:
    try:
        rel = path.relative_to(GAME_ROOT).as_posix()
    except ValueError:
        rel = path.name
    return rel


def optimize_image(img: Image.Image) -> Image.Image:
    if img.mode not in ("RGB", "RGBA"):
        img = img.convert("RGBA")
    w, h = img.size
    if max(w, h) > MAX_EDGE:
        ratio = MAX_EDGE / max(w, h)
        img = img.resize((int(w * ratio), int(h * ratio)), Image.Resampling.LANCZOS)
    return img


def save_webp(img: Image.Image, dest: Path) -> int:
    dest.parent.mkdir(parents=True, exist_ok=True)
    buf = BytesIO()
    img.save(buf, format="WEBP", quality=WEBP_QUALITY, method=WEBP_METHOD)
    data = buf.getvalue()
    dest.write_bytes(data)
    return len(data)


def load_progress() -> set[str]:
    if not PROGRESS_PATH.is_file():
        return set()
    data = json.loads(PROGRESS_PATH.read_text(encoding="utf-8"))
    return set(data.get("processed_sources", []))


def save_progress(done: set[str]) -> None:
    PROGRESS_PATH.write_text(
        json.dumps({"processed_sources": sorted(done)}, indent=2),
        encoding="utf-8",
    )


def load_seen_names() -> set[str]:
    """Nomes Unity já exportados (manifest + arquivos .webp existentes)."""
    seen: set[str] = set()

    if MANIFEST_PATH.is_file():
        try:
            manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
            for entry in manifest:
                if entry.get("name"):
                    seen.add(entry["name"])
        except json.JSONDecodeError:
            pass

    for webp in OUT_DIR.glob("*.webp"):
        seen.add(webp.stem)

    return seen


def load_manifest() -> list[dict]:
    if not MANIFEST_PATH.is_file():
        return []
    try:
        return json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return []


def save_manifest(manifest: list[dict]) -> None:
    by_name: dict[str, dict] = {}
    for entry in manifest:
        key = entry.get("name") or entry.get("id", "")
        if key:
            by_name[key] = entry
    merged = sorted(by_name.values(), key=lambda x: (x.get("name") or "").lower())
    MANIFEST_PATH.write_text(
        json.dumps(merged, indent=2, ensure_ascii=False), encoding="utf-8"
    )


def export_texture(obj, name: str) -> dict | None:
    try:
        data = obj.read()
        img = getattr(data, "image", None)
        if img is None:
            return None
        safe = sanitize(name)
        dest = OUT_DIR / f"{safe}.webp"
        if dest.is_file():
            return None
        optimized = optimize_image(img)
        size = save_webp(optimized, dest)
        return {
            "id": safe.lower(),
            "name": name,
            "path": f"/assets/game/{safe}.webp",
            "width": optimized.width,
            "height": optimized.height,
            "bytes": size,
        }
    except Exception:
        return None


def process_env(env, seen: set[str], manifest: list[dict]) -> int:
    added = 0
    for obj in env.objects:
        if obj.type.name not in ("Texture2D", "Sprite"):
            continue
        try:
            tree = obj.read_typetree()
            name = (tree.get("m_Name") or "").strip()
        except Exception:
            continue
        if not name or EXCLUDE_NAME.search(name):
            continue
        safe = sanitize(name)
        if name in seen or safe in seen:
            continue
        entry = export_texture(obj, name)
        if entry:
            manifest.append(entry)
            seen.add(name)
            seen.add(safe)
            added += 1
    return added


def iter_unity_sources() -> list[Path]:
    sources: list[Path] = []
    for p in sorted(GAME_ROOT.glob("*.assets")):
        if not p.name.endswith(".resS"):
            sources.append(p)
    archives = GAME_ROOT / "StreamingAssets" / "ContentArchives"
    if archives.is_dir():
        sources.extend(sorted(f for f in archives.iterdir() if f.is_file()))
    return sources


def rebuild_manifest_from_disk() -> list[dict]:
    """Sincroniza manifest com todos os .webp na pasta."""
    entries: list[dict] = []
    existing = load_manifest()
    by_path = {e.get("path"): e for e in existing if e.get("path")}

    for webp in sorted(OUT_DIR.glob("*.webp")):
        path = f"/assets/game/{webp.name}"
        if path in by_path:
            entries.append(by_path[path])
        else:
            entries.append(
                {
                    "id": webp.stem.lower(),
                    "name": webp.stem,
                    "path": path,
                    "width": 0,
                    "height": 0,
                    "bytes": webp.stat().st_size,
                    "resumed": True,
                }
            )
    return entries


def archive_has_new_textures(env, seen: set[str]) -> bool:
    for obj in env.objects:
        if obj.type.name not in ("Texture2D", "Sprite"):
            continue
        try:
            tree = obj.read_typetree()
            name = (tree.get("m_Name") or "").strip()
        except Exception:
            continue
        if not name or EXCLUDE_NAME.search(name):
            continue
        if name not in seen and sanitize(name) not in seen:
            return True
    return False


def bootstrap_done_sources(seen: set[str], sources: list[Path], done: set[str]) -> None:
    """Marca bundles já totalmente extraídos (evita revarrer tudo sem progress.json)."""
    log("Bootstrap: identificando arquivos já completos (sem reexportar)...")
    for i, src in enumerate(sources):
        sid = source_id(src)
        if sid in done:
            continue
        try:
            env = UnityPy.load(str(src))
            if not archive_has_new_textures(env, seen):
                done.add(sid)
        except Exception:
            pass
        if i > 0 and i % 200 == 0:
            log(f"  bootstrap [{i}/{len(sources)}] marcados: {len(done)}")
            save_progress(done)


def main() -> None:
    if not GAME_ROOT.is_dir():
        log(f"ERRO: Jogo não encontrado em {GAME_ROOT}")
        sys.exit(1)

    OUT_DIR.mkdir(parents=True, exist_ok=True)

    done_sources = load_progress()
    seen = load_seen_names()
    manifest = load_manifest()
    sources = iter_unity_sources()
    webp_count = len(list(OUT_DIR.glob("*.webp")))

    if not done_sources and webp_count > 0:
        log(f"Sem progress.json — reconstruindo checkpoint ({webp_count} WebP existentes)...")
        bootstrap_done_sources(seen, sources, done_sources)

    pending = [s for s in sources if source_id(s) not in done_sources]

    log(f"=== Extração V Rising ===")
    log(f"Já exportados (nomes): {len(seen)}")
    log(f"Arquivos WebP na pasta: {len(list(OUT_DIR.glob('*.webp')))}")
    log(f"Fontes já processadas: {len(done_sources)} / {len(sources)}")
    log(f"Fontes restantes: {len(pending)}")

    if not pending:
        log("Nada pendente — apenas sincronizando manifest...")
        save_manifest(rebuild_manifest_from_disk())
        log("Manifest atualizado.")
        return

    added_session = 0
    for i, src in enumerate(pending):
        sid = source_id(src)
        if i % CHECKPOINT_EVERY == 0:
            log(f"  [{i + 1}/{len(pending)}] +{added_session} nesta sessão | total nomes: {len(seen)}")
            save_manifest(manifest)
            save_progress(done_sources)

        try:
            env = UnityPy.load(str(src))
            added_session += process_env(env, seen, manifest)
        except Exception as e:
            log(f"  ERRO em {src.name}: {e}")

        done_sources.add(sid)

    for png_name in ("SaveIconPS4.png", "SaveIconPS5.png"):
        png = GAME_ROOT / "StreamingAssets" / png_name
        if png.is_file() and png.stem not in seen:
            try:
                img = optimize_image(Image.open(png).convert("RGBA"))
                safe = sanitize(png.stem)
                dest = OUT_DIR / f"{safe}.webp"
                if not dest.is_file():
                    size = save_webp(img, dest)
                    manifest.append(
                        {
                            "id": safe.lower(),
                            "name": png.stem,
                            "path": f"/assets/game/{safe}.webp",
                            "width": img.width,
                            "height": img.height,
                            "bytes": size,
                        }
                    )
            except Exception as e:
                log(f"skip {png_name}: {e}")

    manifest = rebuild_manifest_from_disk()
    save_manifest(manifest)
    save_progress(done_sources)

    total_bytes = sum(m.get("bytes", 0) for m in manifest)
    log(f"\nConcluído nesta execução: +{added_session} novas texturas")
    log(f"Total WebP: {len(manifest)} | {total_bytes / 1024 / 1024:.1f} MB")
    log(f"Pasta: {OUT_DIR}")


if __name__ == "__main__":
    main()
