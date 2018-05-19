class Player {

  // warrior.think(Object.keys(warrior.feel()))
  // getLocation,getUnit,isEmpty,isStairs,isUnit,isWall

  // warrior.think(warrior.feel().getLocation())
  // 1,0 etc

  // warrior.think(Object.keys(warrior.feel().getUnit()))
  // isHostile,isFriendly,isPlayer,isWarrior,isBound,isUnderEffect

  playTurn(warrior) {
    warrior.think('Location: '+warrior.feel().getLocation())
    warrior.think('Was: '+this.health+'. Is: '+warrior.health())    

    // Rest/Health Logic
    // If I am low health AND not under archer attack
    // ...I should run away and rest

    // If I am low health 
    if (warrior.health() < 15) {
      // if there is an archer shooting me
      // ...move forward, rescue captive, or attack enemy

      // If my health is decreasing (i.e.: I am under archer attack)
      if (this.health > warrior.health()) {
        // if the adjacent room has a unit
        if (warrior.feel().isUnit()) {
          // assigned for ease of reading code
          const unit = warrior.feel().getUnit()
          warrior.think('unit ahead. \tFriendly: '+unit.isFriendly()+'.\tPlayer: '+unit.isPlayer()+'.\t Warrior: '+unit.isWarrior()+'.\tBound: '+unit.isBound()+'\tUnder Effect: '+unit.isUnderEffect()+'.')
          // if the adjacent room unit is a friend and bound
          if (unit.isFriendly() && unit.isBound()) {
            warrior.rescue()
            this.health = warrior.health() 
            return
          } else {
            // The adjacent room unit is not friendly
            warrior.attack()
            this.health = warrior.health() 
            return  
          }
        } else {
          // the adjacent room does not have a unit
          // ..walk towards the archer doing damage
          warrior.walk() 
          this.health = warrior.health()
          return
        }    
      }
      // ...therefore there is no archer
      // if there is no unit in the next square
      if (!warrior.feel().isUnit()) {
        // safe to heal to full
        if(this.health < 20) {
          warrior.rest()
          this.health = warrior.health()
          return  
        }
      } else {
        // there is a unit in the next square...run away
        warrior.walk('backward')
        this.health = warrior.health()
        return
      }
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
