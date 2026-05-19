import mapData from '@/data/vardoran-map.json';
import { assetUrl } from '@/lib/app-path';
import { getEntityBySlug } from '@/lib/entities';

export interface MapMarker {
  id: string;
  bossId: string;
  title: string;
  level?: number;
  x: number;
  y: number;
  fandomSlug?: string;
}

export interface VardoranMapData {
  source: string;
  mapImage: string;
  imageUrl: string;
  bounds: { width: number; height: number };
  origin: string;
  markers: MapMarker[];
}

export const vardoranMap = mapData as VardoranMapData;

/** Imagem local (baixada do script) ou URL remota. */
export const MAP_IMAGE_SRC = assetUrl('/assets/wiki/vardoran-map.jpg');

export function getMapMarkers(): MapMarker[] {
  return vardoranMap.markers;
}

export function getMarkersForBoss(bossId: string): MapMarker[] {
  return vardoranMap.markers.filter((m) => m.bossId === bossId);
}

export function resolveBossFromMarker(marker: MapMarker) {
  const slug = marker.fandomSlug ?? marker.title.replace(/ /g, '_');
  return (
    getEntityBySlug('boss', marker.bossId) ??
    getEntityBySlug('boss', slug)
  );
}
