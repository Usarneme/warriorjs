class Player {
  constructor() {
    this.health = 20,
    this.direction = 'forward',
    this.needsHealing = false
  }

  playTurn(warrior) {
    // Object.keys(this) => health, direction. needsHealing
    warrior.think('\tHealth: '+warrior.health()+' Health last turn: '+this.health+'. Direction: '+this.direction+'. Needs Healing: '+this.needsHealing)

    const wallSet = [
      warrior.feel('forward').isWall() ? 'Forward' : null,
      warrior.feel('right').isWall() ? 'Right' : null,
      warrior.feel('left').isWall() ? 'Left' : null,
      warrior.feel('backward').isWall() ? 'Backward' : null
    ]

    // warrior.feel().getLocation => x,y coordinates of the next room over
    // -1 to the x coord to correct for it being the next room over (and there not being a warrior.getLocation() for the current room)
    // warrior.feel().isEmpty() => no room = nothing, true or false otherwise
    warrior.think('\tLocation [x,y]: [' + (warrior.feel('forward').getLocation()[0] - 1) + ',' + warrior.feel('forward').getLocation()[1] + ']. Walls: ' + wallSet + '. Forward empty: '+warrior.feel('forward').isEmpty() + '. Backward empty: '+warrior.feel('backward').isEmpty())
    
    // nearbySet is an array consisting of the next 3 rooms in the direction you are pointing
    // Each of the three items in nearbySet contain the result of warrior.feel() for that room 
    const nearbySet = warrior.look(this.direction)

    // Object.keys(warrior.feel()) => getLocation,getUnit,isEmpty,isStairs,isUnit,isWall
    // Object.keys(item) => same as above
    nearbySet.forEach(item => {
      warrior.think('\t\tRoom location: [' + item.getLocation() +
       '] Empty: ' + item.isEmpty() + 
       '. Stairs: ' + item.isStairs() +
      '. Wall: ' + item.isWall() +
      '. Unit: ' + item.isUnit()
    )
      if (item.isUnit()) {
        const unit = item.getUnit()
        warrior.think('\t\tUnit at '+ item.getLocation() +'. Friendly: '+unit.isFriendly()+'. Player: '+unit.isPlayer()+'. Warrior: '+unit.isWarrior()+'. Bound: '+unit.isBound()+' Under Effect: '+unit.isUnderEffect()+'.')
      }
    })
    // End of Information Block


    // Direction logic 
    // if a wall is encountered, change direction
    if (warrior.feel().isWall()) {
      // warrior.think('there is a wall '+this.direction)
      if (this.direction == 'forward') {
        this.direction = 'backward'
      } else {
        this.direction = 'forward'
      }
      warrior.pivot()
      this.health = warrior.health() 
      return
    }

    // Rest/Health Logic

    // If I am low health I should run away and rest
    if (warrior.health() < 11) {
      this.needsHealing = true
    }

    if (this.needsHealing) {
      // If my health is decreasing (i.e.: I am under archer/mage attack)
      if (this.health > warrior.health()) {
        // ...change direction
        if (this.direction == 'forward') {
          this.direction = 'backward'
        } else {
          this.direction = 'forward'
        }  
        // ...and run away
        warrior.walk(this.direction)
        this.health = warrior.health()
        return
      }
      // else There is no archer/mage therefore it is safe to heal to full
      warrior.rest()
      this.health = warrior.health()
      if (warrior.health() > 19) {
        this.needsHealing = false
      }
      return  
    }

    
    // Adjacent unit Logic (full health)

    // Object.keys(warrior.feel().getUnit()) => isHostile,isFriendly,isPlayer,isWarrior,isBound,isUnderEffect

    const one = nearbySet[0].getUnit(),
          two = nearbySet[1].getUnit(),
          three = nearbySet[2].getUnit()

    // If there is an enemy two or three squares away...
    if ( ((two !== undefined) && two.isHostile()) || ((three !== undefined) && three.isHostile()) ) {
      // But also a friendly one or two squares away
      if ( ((one !== undefined) && one.isFriendly()) || ((two !== undefined) && two.isFriendly()) ) {
        // ...do nothing
      } else {
        // Shoot the enemy
        warrior.shoot()
        this.health = warrior.health() 
        return
      }
    }

    // Attack enemy or rescue adjacent square captive
    if (warrior.feel().isUnit()) {
      // assigned to variable for ease of reading code
      const unit = warrior.feel().getUnit()
      warrior.think('unit ahead. \tFriendly: '+unit.isFriendly()+'.\tPlayer: '+unit.isPlayer()+'.\t Warrior: '+unit.isWarrior()+'.\tBound: '+unit.isBound()+'\tUnder Effect: '+unit.isUnderEffect()+'.')
      // if the adjacent room unit is a friend and bound
      if (unit.isFriendly() && unit.isBound()) {
        warrior.rescue()
        this.health = warrior.health() 
        return
      } else {
        // The unit is not friendly
        warrior.attack()
        this.health = warrior.health() 
        return  
      }
    } 

    // Default to walk 
    warrior.walk() 
    this.health = warrior.health()
    return
  } // end of playTurn
}
