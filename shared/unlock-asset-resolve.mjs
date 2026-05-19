/**
 * Ícones de poderes vampíricos, formas e recompensas sem página na wiki.
 * Valores = nome do asset em client/public/assets/game/manifest.json
 */

export const UNLOCK_ASSET_BY_EN = {
  'Wolf Form': 'Stunlock_Icon_Ability_Shapeshift_Wolf',
  'Rat Form': 'Stunlock_Icon_Ability_Shapeshift_Rat',
  'Bear Form': 'Stunlock_Icon_Ability_Shapeshift_Bear',
  'Spider Form': 'Stunlock_Icon_Ability_Shapeshift_Spider',
  'Toad Form': 'Stunlock_Icon_Ability_Shapeshift_Toad',
  'Bat Form': 'Stunlock_Icon_Ability_Shapeshift_Bat',
  'Human Form': 'Stunlock_Icon_Ability_Shapeshift_Human',
  'Blood Hunger': 'Stunlock_Icon_BloodHunger',
  'Blood Rage': 'Stunlock_Icon_Ability_Spell_Blood_BloodRage',
  'Blood Fountain': 'Stunlock_Icon_Ability_Spell_Blood_BloodFontain',
  'Blood Storm': 'Stunlock_Icon_Ability_Spell_Blood_BloodStorm',
  'Blood Rite': 'Stunlock_Icon_Ability_Spell_Blood_VampiricCurse',
  'Veil of Blood': 'Stunlock_Icon_Ability_Spell_Blood_VeilOfBlood',
  'Veil of Frost': 'Stunlock_Icon_Ability_Spell_Frost_VeilOfFrost',
  'Veil of Chaos': 'Stunlock_Icon_Ability_Spell_Chaos_VeilOfChaos',
  'Veil of Bones': 'Stunlock_Icon_Ability_Spell_Unholy_VeilOfUnholy',
  'Veil of Illusion': 'Stunlock_Icon_Ability_Spell_Illusion_VeilOfIllusion',
  'Veil of Storm': 'Stunlock_Icon_Ability_Spell_Storm_VeilOfStorm',
  'Veil of Shadow': 'Stunlock_Icon_Ability_Spell_Shadow_VeilOfShadow',
};

export const UNLOCK_ASSET_BY_PT = {
  'Forma de Lobo': 'Stunlock_Icon_Ability_Shapeshift_Wolf',
  'Forma de Rato': 'Stunlock_Icon_Ability_Shapeshift_Rat',
  'Forma de Urso': 'Stunlock_Icon_Ability_Shapeshift_Bear',
  'Forma de Aranha': 'Stunlock_Icon_Ability_Shapeshift_Spider',
  'Forma de Sapo': 'Stunlock_Icon_Ability_Shapeshift_Toad',
  'Forma de Morcego': 'Stunlock_Icon_Ability_Shapeshift_Bat',
  'Forma Humana': 'Stunlock_Icon_Ability_Shapeshift_Human',
  'Fome de Sangue': 'Stunlock_Icon_BloodHunger',
  'Essência de Sangue Maior': 'Stunlock_Icon_Item_BloodEssence03',
  'Fúria de Sangue': 'Stunlock_Icon_Ability_Spell_Blood_BloodRage',
  'Fonte de Sangue': 'Stunlock_Icon_Ability_Spell_Blood_BloodFontain',
  'Tempestade de Sangue': 'Stunlock_Icon_Ability_Spell_Blood_BloodStorm',
  'Véu de Sangue': 'Stunlock_Icon_Ability_Spell_Blood_VeilOfBlood',
  'Véu de Gelo': 'Stunlock_Icon_Ability_Spell_Frost_VeilOfFrost',
  'Véu de Caos': 'Stunlock_Icon_Ability_Spell_Chaos_VeilOfChaos',
  'Véu de Ossos': 'Stunlock_Icon_Ability_Spell_Unholy_VeilOfUnholy',
  'Véu de Ilusão': 'Stunlock_Icon_Ability_Spell_Illusion_VeilOfIllusion',
  'Véu de Tempestade': 'Stunlock_Icon_Ability_Spell_Storm_VeilOfStorm',
  'Véu das Sombras': 'Stunlock_Icon_Ability_Spell_Shadow_VeilOfShadow',
  'Véu do Fantasma': 'Stunlock_Icon_Ability_Spell_Shadow_VeilOfShadow',
  'Foice (Ceifador)': 'Stunlock_Icon_IronScythe01',
  'Slashers': 'Stunlock_Icon_IronSlashers01',
  'Besta de Cobre': 'Stunlock_Icon_Copper_Bow01',
  'Pistolas': 'Stunlock_Icon_IronPistol01',
  'Espadas Gêmeas': 'Stunlock_Icon_IronTwinBlades01',
};

export function manifestAssetPath(assetName, manifestByName) {
  if (!assetName || !manifestByName) return '';
  const direct = manifestByName.get(assetName);
  if (direct?.path) return direct.path;
  for (const [key, entry] of manifestByName) {
    if (key === assetName) return entry.path;
  }
  return '';
}

export function lookupUnlockAssetImage({ nameEn, namePt, manifestByName }) {
  const assetName =
    (nameEn && UNLOCK_ASSET_BY_EN[nameEn]) ||
    (namePt && UNLOCK_ASSET_BY_PT[namePt]) ||
    '';
  return manifestAssetPath(assetName, manifestByName);
}
