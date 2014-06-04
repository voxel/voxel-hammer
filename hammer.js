'use strict';

module.exports = function(game, opts) {
  return new HammerPlugin(game, opts);
};
module.exports.pluginInfo = {
  loadAfter: ['voxel-registry', 'voxel-mine', 'voxel-inventory-hotbar', 'voxel-recipes']
};

function HammerPlugin(game, opts) {
  this.game = game;

  this.registry = game.plugins.get('voxel-registry');
  if (!this.registry) throw new Error('voxel-hammer requires voxel-registry plugin');

  this.mine = game.plugins.get('voxel-mine');
  if (!this.mine) throw new Error('voxel-hammer requires voxel-mine');

  this.hotbar = game.plugins.get('voxel-inventory-hotbar'); // TODO: carry?
  if (!this.hotbar) throw new Error('voxel-hammer requires voxel-inventory-hotbar');

  this.recipes = game.plugins.get('voxel-recipes'); // optional

  this.enable();
};

HammerPlugin.prototype.enable = function() {
  this.registry.registerItem('hammer', {
    itemTexture: 'items/iron_pickaxe', // TODO
    displayName: 'Hammer',
    speed: 25.0,
    //maxDamage: // TODO
    toolClass: 'pickaxe',
  });
  if (this.recipes) {
    this.recipes.registerPositional([
        ['ingotIron', 'ingotIron', 'ingotIron'],
        ['ingotIron', 'stick', 'ingotIron'],
        [undefined, 'stick', undefined]], ['hammer']);
  }
  this.mine.on('break', this.break.bind(this));
};

HammerPlugin.prototype.disable = function() {
};

var around = function(cb) {
  [-1, 0, 1].forEach(function(dx) {
    [-1, 0, 1].forEach(function(dy) {
      [-1, 0, 1].forEach(function(dz) {
        cb(dx, dy, dz);
      });
    });
  });
};

HammerPlugin.prototype.break = function(target) {
  var heldItem = this.hotbar.held();

  if (!heldItem || heldItem.item !== 'hammer') return; // TODO: can voxel-mine call us from registry property, instead? (ala onUse voxel-use)
  if (target.fromHammer) return; // don't respond to our own events TODO: generic fromPlayer/synthetic property?

  console.log(target);
  around(function(dx, dy, dz) {
    var x = target.voxel[0] + (target.normal[0] === 0 ? dx : 0);
    var y = target.voxel[1] + (target.normal[1] === 0 ? dy : 0);
    var z = target.voxel[2] + (target.normal[2] === 0 ? dz : 0);
    console.log(x,y,z);

    this.mine.emit('break', {voxel:[x,y,z], value:target.value, fromHammer:true}); // removes block, damages tool, adds to inventory
  }.bind(this));
};
