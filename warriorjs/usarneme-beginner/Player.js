class Player {
  constructor() {
    this.health = 20,
    this.direction = 'forward'
    this.needsHealing = false
  }
  
  // warrior.think(Object.keys(warrior.feel()))
  // getLocation,getUnit,isEmpty,isStairs,isUnit,isWall

  // getLocation = 1,0 etc

  // warrior.think(Object.keys(warrior.feel().getUnit()))
  // isHostile,isFriendly,isPlayer,isWarrior,isBound,isUnderEffect

  // warrior.think(warrior.feel().isEmpty())
  // no room = nothing, true or false otherwise


  playTurn(warrior) {
    warrior.think(Object.keys(this).map(attribute => {
      return '\t' + attribute + ' : ' + this[attribute]
    }))

    warrior.think('he is at location: ' + warrior.feel().getLocation() + ' with walls: ' + warrior.feel('right').isWall() ? 'R' : '' + warrior.feel('forward').isWall() ? 'F' : '' + warrior.feel('left').isWall() ? +'L' : '' + warrior.feel('backward').isWall() ? 'B' : '')
    warrior.think('his health last turn was: '+this.health+'. Now it is: '+warrior.health())

    // Direction logic 
    // if a wall is encountered, change direction
    if (warrior.feel().isWall()) {
      warrior.think('there is a wall '+this.direction)
      if (this.direction == 'forward') {
        this.direction = 'backward'
      } else {
        this.direction = 'forward'
      }
      warrior.pivot()
      this.health = warrior.health() 
      return
    }

    // // always start by moving to the left-most room
    // if (warrior.feel().getLocation()[0] > 1 && this.direction == 'backward') {
    //   // check to the left for a captive or enemy unit
    //   if (warrior.feel('backward').isUnit()) {
    //     // if it's a friendly
    //     if (warrior.feel('backward').getUnit().isFriendly()) {
    //       // ...rescue the captive
    //       warrior.rescue('backward')
    //       this.health = warrior.health() 
    //       return
    //     } else {
    //       // ...otherwise attack the enemy
    //       warrior.attack('backward')
    //       this.health = warrior.health() 
    //       return
    //     }
    //   } else {
    //     warrior.walk('backward')
    //     this.health = warrior.health() 
    //     return
    //   }
    // }

    // // Once the left-most area has been cleared, reset the direction to forward
    // if (warrior.feel().getLocation()[0] == 1) {
    //   this.direction = 'forward'
    // }

    // Rest/Health Logic

    // If I am low health I should run away and rest
    if (warrior.health() < 11) {
      this.needsHealing = true
    }

    if (this.needsHealing) {
      // If my health is decreasing (i.e.: I am under archer attack)
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
      // else There is no archer therefore it is safe to heal to full
      warrior.rest()
      this.health = warrior.health()
      if (warrior.health() > 19) {
        this.needsHealing = false
      }
      return  
    }

    // Adjacent unit Logic (full health)

    // attack enemy or rescue captive
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
