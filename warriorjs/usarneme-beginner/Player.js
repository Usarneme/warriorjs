class Player {
  // this.health to track player's health
  constructor() {
    this.health = 20,
    this.direction = 'backward'
    this.needsHealing = false
  }
  
  // warrior.think(Object.keys(warrior.feel()))
  // getLocation,getUnit,isEmpty,isStairs,isUnit,isWall

  // warrior.think(warrior.feel().getLocation())
  // 1,0 etc

  // warrior.think(Object.keys(warrior.feel().getUnit()))
  // isHostile,isFriendly,isPlayer,isWarrior,isBound,isUnderEffect

  playTurn(warrior) {
    warrior.think('Location: '+warrior.feel().getLocation())
    warrior.think('loc[0]: '+warrior.feel().getLocation()[0])
    warrior.think('Was: '+this.health+'. Is: '+warrior.health())

    // always start by moving to the left-most room
    if (warrior.feel().getLocation()[0] > 1 && this.direction == 'backward') {
      // check to the left for a captive or enemy unit
      if (warrior.feel('backward').isUnit()) {
        // if it's a friendly
        if (warrior.feel('backward').getUnit().isFriendly()) {
          // ...rescue the captive
          warrior.rescue('backward')
          this.health = warrior.health() 
          return
        } else {
          // ...otherwise attack the enemy
          warrior.attack('backward')
          this.health = warrior.health() 
          return
        }
      } else {
        warrior.walk('backward')
        this.health = warrior.health() 
        return
      }
    }

    // Once the left-most area has been cleared, reset the direction to forward
    if (warrior.feel().getLocation()[0] == 1) {
      this.direction = 'forward'
    }

    // Rest/Health Logic
    // If I am low health AND NOT under archer attack
    // ...I should run away and rest

    // If I am low health 
    if (warrior.health() < 11) {
      this.needsHealing = true
    }

    if (this.needsHealing) {
      // If my health is decreasing (i.e.: I am under archer attack)
      if (this.health > warrior.health()) {
        // ...run away
        warrior.walk('backward')
        this.health = warrior.health()
        return
      }
      // ...therefore there is no archer
      // ...therefore it is safe to heal to full
      warrior.rest()
      this.health = warrior.health()
      if (warrior.health() == 20) {
        this.needsHealing = false
      }
      return  
    }

    // Adjacent unit Logic (full health)
    // attack enemy or rescue captive
    if (warrior.feel().isUnit()) {
      // assigned for ease of reading code
      const unit = warrior.feel().getUnit()
      // if the adjacent room unit is a friend and bound
      warrior.think('captive ahead. \tFriendly: '+unit.isFriendly()+'.\tPlayer: '+unit.isPlayer()+'.\t Warrior: '+unit.isWarrior()+'.\tBound: '+unit.isBound()+'\tUnder Effect: '+unit.isUnderEffect()+'.')
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

    // Default to walk forward
    warrior.walk() 
    this.health = warrior.health() 
  }
}
