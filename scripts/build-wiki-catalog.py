"""
Gera wiki-catalog.json: imagens do jogo + descrições (Fandom/entities/localização PT).
Uso: python scripts/build-wiki-catalog.py
"""
from __future__ import annotations

import json
import re
from pathlib import Path

PROJECT = Path(__file__).resolve().parents[1]
MANIFEST_PATH = PROJECT / "client/public/assets/game/manifest.json"
FANDOM_PATH = PROJECT / "client/src/data/wiki-entries.generated.json"
ENTITIES_PATH = PROJECT / "client/src/data/entities.json"
LOC_BR = Path(
    r"D:\SteamLibrary\steamapps\common\VRising\VRising_Data\StreamingAssets\Localization\Brazilian.json"
)
OUT_PATH = PROJECT / "client/src/data/wiki-catalog.json"

ASSET_MAP: dict[str, list[str]] = {
    "dracula-the-immortal-king": ["Portrait_Small_Normal_Dracula", "MapIcon_SoulShard_Dracula"],
    "alpha-the-white-wolf": ["Portrait_Small_Normal_AlphaWolf"],
    "keely-the-frost-archer": ["Portrait_Small_Normal_KeelyFrostArcher"],
    "vincent-the-frostbringer": ["Portrait_Small_Normal_VincentFrostbringer"],
    "tristan-the-vampire-hunter": ["Portrait_Small_Normal_TristanVampireHunter"],
    "solarus-the-immaculate": ["Portrait_Small_Normal_SolarusImmaculate"],
    "blood-rite": ["Stunlock_Icon_Ability_Spell_Blood_Guard", "Stunlock_Icon_Ability_Spell_Blood_CrimsonAegis"],
    "veil-of-blood": ["Stunlock_Icon_Ability_Spell_Blood_VeilOfBlood"],
    "blood-rage": ["Stunlock_Icon_Ability_Spell_Blood_BloodRage"],
    "veil-of-shadow": ["Stunlock_Icon_Ability_Spell_Shadow_VeilOfShadow"],
    "blood-essence": ["Stunlock_Icon_Item_BloodEssence01"],
    "primal-blood-essence": ["Stunlock_Icon_Item_PrimalBloodEssence", "Stunlock_Icon_Item_BloodEssence04"],
    "blood-orb": ["Stunlock_Icon_Item_BloodOrb", "Stunlock_Icon_Item_BloodEssence02"],
    "soul-shard-of-dracula": ["MapIcon_SoulShard_Dracula03", "Jewelry_SoulShardofDracula"],
    "jewels": ["MapIcon_SoulShard_MapLegend", "Poneti_Icon_Jewelry"],
    "v-rising": ["V_Rising"],
}

DISPLAY_PT: dict[str, str] = {
    "dracula-the-immortal-king": "Drácula, o Rei Imortal",
    "alpha-the-white-wolf": "Alpha, o Lobo Branco",
    "keely-the-frost-archer": "Keely, a Arqueira do Gelo",
    "vincent-the-frostbringer": "Vincent, o Portador do Gelo",
    "tristan-the-vampire-hunter": "Tristan, o Caçador de Vampiros",
    "solarus-the-immaculate": "Solarus, o Imaculado",
    "blood-rite": "Rito de Sangue",
    "veil-of-blood": "Véu de Sangue",
    "blood-rage": "Fúria de Sangue",
    "veil-of-shadow": "Véu das Sombras",
    "blood-essence": "Essência de Sangue",
    "primal-blood-essence": "Essência de Sangue Primordial",
    "blood-orb": "Orbe de Sangue",
    "soul-shard-of-dracula": "Fragmento de Alma de Drácula",
    "jewels": "Joias (Soul Shards)",
    "v-rising": "V Rising",
}

# Excluir do catálogo automático (não são itens de inventário)
AUTO_EXCLUDE_PATTERNS = (
    "Sapling",
    "Seed",
    "Tree",
    "Disguise",
    "Frame",
    "Hover",
    "Smoke",
    "Disabled",
    "AbilityFrame",
    "Tex_",
    "UI_",
    "_Big",
)


def clean_text(t: str) -> str:
    t = re.sub(r"<[^>]+>", "", t)
    t = t.replace("\\n", " ").replace("\n", " ")
    return re.sub(r"\s+", " ", t).strip()


def load_nodes(path: Path) -> list[dict]:
    if not path.is_file():
        return []
    data = json.loads(path.read_text(encoding="utf-8"))
    return data.get("nodes") or data.get("Nodes") or []


def build_loc_index(nodes: list[dict]) -> dict[str, str]:
    index: dict[str, str] = {}
    for n in nodes:
        t = clean_text(n.get("text", ""))
        if len(t) < 2:
            continue
        key = t.lower()
        if key not in index or len(t) > len(index[key]):
            index[key] = t
    return index


def find_game_description(
    name_pt: str,
    name_en: str,
    nodes: list[dict],
    loc_index: dict[str, str],
    extra_terms: list[str] | None = None,
) -> tuple[str, str]:
    candidates: list[str] = []
    for c in (name_pt, name_en, *(extra_terms or [])):
        if c and c not in candidates:
            candidates.append(c)

    for candidate in candidates:
        key = candidate.lower()
        if key in loc_index:
            desc = loc_index[key]
            if len(desc) > len(candidate) + 15:
                return desc, "game"
            for i, n in enumerate(nodes):
                if clean_text(n.get("text", "")).lower() == key:
                    for j in range(i + 1, min(i + 8, len(nodes))):
                        t2 = clean_text(nodes[j].get("text", ""))
                        if len(t2) > len(candidate) + 25 and not t2.startswith("#"):
                            return t2, "game"

    for candidate in candidates:
        for n in nodes:
            t = clean_text(n.get("text", ""))
            if len(t) < 40:
                continue
            tl = t.lower()
            cl = candidate.lower()
            if cl in tl or tl.startswith(cl):
                return t, "game"

    return "", ""


def asset_extra_terms(asset_name: str) -> list[str]:
    terms: list[str] = []
    if "Spell_Blood_" in asset_name:
        s = asset_name.split("Spell_Blood_")[-1]
        terms.append(re.sub(r"([a-z])([A-Z])", r"\1 \2", s))
    if "Spell_Shadow_" in asset_name:
        s = asset_name.split("Spell_Shadow_")[-1]
        terms.append(re.sub(r"([a-z])([A-Z])", r"\1 \2", s))
    if "Item_" in asset_name:
        s = asset_name.split("Item_")[-1]
        terms.append(re.sub(r"([a-z])([A-Z])", r"\1 \2", s))
    if "Ability_Weapon_" in asset_name:
        s = asset_name.split("Ability_Weapon_")[-1]
        terms.append(re.sub(r"([a-z])([A-Z])", r"\1 \2", s))
    return terms


def load_manifest_by_name() -> dict[str, dict]:
    if not MANIFEST_PATH.is_file():
        return {}
    items = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    return {x["name"]: x for x in items if x.get("name")}


def load_entities_index() -> dict[str, dict]:
    if not ENTITIES_PATH.is_file():
        return {}
    data = json.loads(ENTITIES_PATH.read_text(encoding="utf-8"))
    index: dict[str, dict] = {}
    for e in data.get("entities", []):
        index[e.get("id", "")] = e
        index[e.get("slug", "").lower()] = e
        if e.get("gameAssetName"):
            index[e["gameAssetName"].lower()] = e
        index[e.get("nameEn", e.get("name", "")).lower()] = e
    return index


def resolve_asset(patterns: list[str], by_name: dict[str, dict]) -> dict | None:
    for pat in patterns:
        if pat in by_name:
            return by_name[pat]
        for name, entry in by_name.items():
            if pat.lower() == name.lower():
                return entry
        for name, entry in by_name.items():
            if pat.lower() in name.lower() and "Smoke" not in name and "_Big" not in name:
                if "Portrait" in pat or "Icon" in pat or pat in name:
                    return entry
    return None


def asset_name_to_display(name: str) -> str:
    n = name
    for prefix in (
        "Stunlock_Icon_Ability_Spell_",
        "Stunlock_Icon_Ability_Weapon_",
        "Stunlock_Icon_Ability_",
        "Stunlock_Icon_Item_",
        "Portrait_Small_Normal_",
        "MapIcon_SoulShard_",
    ):
        if n.startswith(prefix):
            n = n[len(prefix) :]
            break
    n = re.sub(r"([a-z])([A-Z])", r"\1 \2", n)
    return n.replace("_", " ").strip()


def categorize_asset(name: str) -> str:
    if "Portrait_Small" in name:
        return "boss"
    if "SoulShard" in name or "Jewelry" in name or "Jewel" in name:
        return "jewel"
    if "Stunlock_Icon_Ability_Weapon_" in name:
        return "weapon"
    if "Stunlock_Icon_Item_" in name or name.startswith("Item_"):
        return "item"
    if "Stunlock_Icon_Ability_Spell_" in name:
        return "spell"
    if "Stunlock_Icon_Ability_" in name:
        return "spell"
    return "item"


def should_auto_include(name: str) -> bool:
    if any(x in name for x in AUTO_EXCLUDE_PATTERNS):
        return False
    return bool(
        re.search(
            r"^(Stunlock_Icon_(Item|Ability)|Portrait_Small_Normal_|MapIcon_SoulShard_)",
            name,
        )
    )


def description_from_entity(entity: dict) -> str:
    desc = clean_text(entity.get("description", ""))
    if len(desc) > 20 and "recurso extraído" not in desc.lower():
        return desc
    return ""


def main() -> None:
    by_name = load_manifest_by_name()
    br_nodes = load_nodes(LOC_BR)
    loc_index = build_loc_index(br_nodes)
    entities_idx = load_entities_index()

    fandom = []
    if FANDOM_PATH.is_file():
        fandom = json.loads(FANDOM_PATH.read_text(encoding="utf-8"))

    catalog: list[dict] = []
    seen_ids: set[str] = set()

    for raw in fandom:
        eid = raw["id"]
        name_pt = DISPLAY_PT.get(eid, raw.get("name", eid))
        name_en = raw.get("nameEn") or raw.get("name", "")

        asset = resolve_asset(ASSET_MAP.get(eid, []), by_name)
        image = asset["path"] if asset else raw.get("image") or raw.get("imageRemote", "")

        ent = entities_idx.get(eid) or entities_idx.get(name_en.lower())
        entity_desc = description_from_entity(ent) if ent else ""

        extra = asset_extra_terms(asset["name"]) if asset else []
        game_desc, desc_src = find_game_description(
            name_pt, name_en, br_nodes, loc_index, extra
        )
        fandom_desc = clean_text(raw.get("description", ""))

        if entity_desc:
            description = entity_desc
            description_source = "fandom"
        elif game_desc:
            description = game_desc
            description_source = "game"
        elif fandom_desc:
            description = fandom_desc
            description_source = "fandom"
        else:
            description = ""
            description_source = "manual"

        entry = {
            "id": eid,
            "slug": raw.get("slug", eid),
            "name": name_pt,
            "nameEn": name_en,
            "category": raw.get("category", "item"),
            "level": raw.get("level"),
            "image": image,
            "gameAssetName": asset["name"] if asset else None,
            "description": description,
            "descriptionSource": description_source,
            "details": raw.get("level") and f"Nível {raw['level']}" or None,
            "fandomUrl": raw.get("fandomUrl", ""),
        }
        catalog.append(entry)
        seen_ids.add(eid)
        if asset:
            seen_ids.add(asset["name"].lower())

    for name, asset in sorted(by_name.items()):
        if not should_auto_include(name):
            continue
        aid = name.lower()
        if aid in seen_ids:
            continue

        display = asset_name_to_display(name)
        category = categorize_asset(name)

        ent = entities_idx.get(aid) or entities_idx.get(name.lower())
        entity_desc = description_from_entity(ent) if ent else ""

        game_desc, desc_src = find_game_description(
            display, display, br_nodes, loc_index, asset_extra_terms(name)
        )

        if entity_desc:
            description = entity_desc
            description_source = "fandom"
        elif game_desc:
            description = game_desc
            description_source = "game"
        else:
            description = ""
            description_source = "manual"

        catalog.append(
            {
                "id": re.sub(r"[^\w.\-]+", "-", name).lower()[:120],
                "slug": name,
                "name": ent.get("name", display) if ent else display,
                "nameEn": name,
                "category": category,
                "image": asset["path"],
                "gameAssetName": name,
                "description": description,
                "descriptionSource": description_source,
                "fandomUrl": ent.get("fandomUrl", "") if ent else "",
            }
        )
        seen_ids.add(aid)

    catalog.sort(key=lambda x: (x["category"], x["name"].lower()))

    stats = {
        "total": len(catalog),
        "withGameImage": sum(1 for x in catalog if x.get("image", "").startswith("/assets/game")),
        "descriptionsGame": sum(1 for x in catalog if x.get("descriptionSource") == "game"),
        "descriptionsFandom": sum(1 for x in catalog if x.get("descriptionSource") == "fandom"),
        "withDescription": sum(1 for x in catalog if len(x.get("description", "")) > 15),
        "byCategory": {},
    }
    for c in catalog:
        cat = c["category"]
        stats["byCategory"][cat] = stats["byCategory"].get(cat, 0) + 1

    OUT_PATH.write_text(
        json.dumps({"stats": stats, "entries": catalog}, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )

    print(f"Catálogo: {stats['total']} entradas -> {OUT_PATH}")
    print(f"  Com descrição: {stats['withDescription']}")
    print(f"  Por categoria: {stats['byCategory']}")


if __name__ == "__main__":
    main()
