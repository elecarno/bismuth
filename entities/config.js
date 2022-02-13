exports.colTiles = [3, 7, 8, 11, 14, 17, 18, 19, 20, 21, 22, 23, 25, 26, 27, 28, 29, 30, 31, 
32, 33, 34, 35, 36, 37, 38, 39]
exports.intTiles = [7, 22, 23, 25, 26, 27, 28, 29, 30, 31, 32, 33]
exports.autoGuns = ["shroom_k"]
exports.singleGuns = ["hunting_rifle"]
exports.meleeWeapons = ["survival_knife"]
exports.miningTools = ["bronze_pickaxe", "iron_pickaxe", "iron_drill"]
exports.harvestTools = ["survival_knife", "bronze_sickle", "iron_sickle"]
exports.workTools = ["bronze_chisel", "iron_chisel"]
exports.placeableItems = [
"rock", "rocky_floor", "granite", "earth", "beq_rock", 
"stone", "organic_floor", "dirt_floor", "cave_flower", "toad_shroom", 
"pollen_shroom", "bronze_berry", "mound", "oxygen_canister", "shroom_wood", "iron_ore", 
"carbon_dioxide_canister", "old_workbench", "old_furnace", "metalworking_bench", 
"rock_tiles", "forge", "lysis_machine", "air_extractor", "smelter", "alchemy_table",
"masonry_bench", "shaper", "armoury", "refinery", "aluminium_ore", "blood_core",
"rock_wall","rock_fence_horizontal",  "rock_fence_vertical", "rock_pillar"
]
exports.priorityTiles = [3, 7, 8, 11, 14, 17, 18, 19, 20, 21, 22, 23, 25, 26, 27, 28, 29, 30,
31, 32, 33, 34, 35, 36, 37, 38, 39]
exports.weaponStrengths = {
    "survival_knife" : 12,
    "shroom_k" : 1,
    "hunting_rifle" : 5
}
exports.bullets = ["bronze_round", "iron_round", "compound_round"]
exports.bulletStrengths = {
    "bronze_round" : 1,
    "iron_round" : 1.5,
    "compound_round": 2,
}
exports.placeIds = {
    "rock" : 3, "rocky_floor" : 2, "granite": 8, "organic_floor": 13, "beq_rock": 14,
    "dirt_floor": 10, "earth": 11, "stone": 15, "cave_flower": 6, "toad_shroom": 4, 
    "pollen_shroom": 5, "bronze_berry": 16, "iron_ore": 17, "mound": 18,
    "oxygen_canister": 19, "shroom_wood": 20, "carbon_dioxide_canister": 21,
    "old_workbench": 7, "old_furnace": 22, "metalworking_bench": 23, "rock_tiles": 24,
    "forge": 25, "lysis_machine": 26, "air_extractor": 27, "smelter": 28, "alchemy_table": 29,
    "masonry_bench": 30, "shaper": 31, "armoury": 32, "refinery": 33, "aluminium_ore": 34,
    "blood_core": 35, "rock_wall": 36, "rock_fence_horizontal": 37, 
    "rock_fence_vertical": 38, "rock_pillar": 39
}
exports.miningToolStrengths = {
    "bronze_pickaxe": 1.5,
    "iron_pickaxe": 4, // should be 2 in later updates
    "iron_drill": 7,
}
exports.harvestToolStrengths = {
    "survival_knife": 0.5,
    "bronze_sickle": 1,
    "iron_sickle": 2,
}
exports.workToolStrengths = {
    "bronze_chisel": 1,
    "iron_chisel": 2,
}
exports.tileStrengths = {
    2:20, 3:40, 4:5, 5:5, 6:5, 7:100,
    8:55, 10:20, 11:30, 13:20, 14:50, 15:5,
    16:10, 17:50, 18:55, 19:120, 20:30, 21:120, 22:135, 24:35,
    23:120, 25:140, 26:140, 27:135, 28:140, 29:110, 30:115,
    31:140, 32:140, 33:150, 34:75, 35:250, 36:300, 37:200, 38:200, 39:250
}
exports.mineTiles = [2,3,8,13,14,10,11,17,18,34,36,37,38,39]
exports.harvestTiles = [4,5,6,15,16,35]
exports.workTiles = [7,19,20,21,22,24,25,26,27,28,29,30,31,32,33]

exports.floor1Tiles = [1,2,3,4,5,6,7,8,17,20]
exports.floor2Tiles = [12,13,14,16]
exports.floor3Tiles = [9,10,11,15,18,22,23,24,25,26,27,28,29,30,31,32,33,34,35,19,21,36,
37,38,39]

exports.craftingRecipes = [
    ["toad_shroom", "stone", "shroom_wood"],
    ["pollen_shroom", "cave_flower", "fibres"],
    ["bronze_berry","fibres","shroom_wood","bronze_pickaxe"],
    ["bronze_berry","fibres","shroom_wood","bronze_sickle"],
    ["stone","bronze_berry","fibres","shroom_wood","bronze_chisel"],
    ["bronze_berry", "stone", "bronze_round_kit"],
    ["iron_bar", "stone", "iron_round_kit"],
    ["copper", "bronze_berry", "stone", "compound_round_kit"],
]
exports.workbenchRecipes = [
    ["iron_panel", "bolts", "fibres", "forge"],
    ["iron_panel", "bolts", "stone", "refinery"],
    ["turbine", "precision_blade", "bolts", "iron_panel", "air_extractor"],
    ["electrical_parts", "turbine", "iron_panel", "lysis_machine"],
    ["reinforced_bone", "shroom_wood", "pollen_shroom", "fibres", "alchemy_table"],
    ["stone", "iron_bar", "shroom_wood", "fibres", "masonry_bench"],
    ["iron_panel", "bolts", "turbine", "stone", "smelter"],
    ["precision_blade", "drill_bit", "shroom_wood", "bolts", "shaper"],
    ["precision_blade", "shroom_wood", "bolts", "armoury"],
    ["iron_bar", "stone", "metalworking_bench"]
]
exports.furnaceRecipes = [
    ["iron_ore", "iron_bar"],
]
exports.metalworkRecipes = [
    ["iron_bar", "iron_panel"],
    ["iron_bar", "bolts"],
    ["iron_bar", "weaponry_mould"],
    ["iron_bar", "industrial_mould"],
]
exports.forgeRecipes = [
    ["iron_bar", "aluminium_bar", "industrial_mould", "turbine"],
    ["aluminium_bar", "industrial_mould", "precision_blade"],
    ["radium", "aluminium_bar", "electrical_parts"],
    ["iron_bar", "industrial_mould", "drill_bit"],
    ["aluminium_bar", "weaponry_mould", "blade_kit"],
    ["iron_bar", "weaponry_mould", "rifle_kit"],
    ["iron_bar", "weaponry_mould", "pistol_kit"],
]
exports.smelterRecipes = [
    ["iron_bar", "graphite", "steel_bar"],
]
exports.airRecipes = [
    ["cave_flower", "carbon_dioxide_canister"],
    ["cave_flower", "radium"],
]
exports.lysisRecipes = [
    ["carbon_dioxide_canister", "oxygen_canister"],
    ["carbon_dioxide_canister", "graphite"],
    ["bronze_berry", "bronze_leaf"],
    ["bronze_berry", "copper"],
]
exports.alchemyRecipes = [
    ["blood_bag", "blood_core"],
]
exports.masonryRecipes = [
    ["rock", "rock_tile_kit"],
    ["rock", "rock_wall"],
    ["rock", "rock_fence_kit"],
    ["rock", "rock_pillar"],
]
exports.shaperRecipes = [
    ["drill_bit", "electrical_parts", "blood_core", "iron_panel", "iron_drill"],
    //["drill_bit", "electrical_parts", "blood_core", "steel_bar", "steel_drill"],
]
exports.armouryRecipes = [
    ["rifle_kit", "shroom_wood", "shroom_k"],
    ["rifle_kit", "shroom_wood", "hunting_rifle"],
]
exports.refineryRecipes = [
    ["aluminium_ore", "aluminium_bar"],
]