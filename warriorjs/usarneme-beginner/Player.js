class Player {
  constructor() {
    this.health = 20,
    this.direction = 'forward',
    this.needsHealing = false,
    this.firstTurn = true,
    this.seenStairs = false
  }

  playTurn(warrior) {
    if (this.firstTurn) {
      this.direction = 'backward'
      warrior.pivot()
      this.firstTurn = false
      this.health = warrior.health() 
      return
    }

    // if this is my first time seeing the stairs...
    if (!this.seenStairs) {
      // turn around and make sure the level is cleared before exiting
      if (warrior.feel('forward').isStairs()) {
        this.seenStairs = true
        warrior.pivot()
        this.health = warrior.health() 
        return
      }
    }

    // Object.keys(this) => health, direction. needsHealing
    warrior.think('\tHealth: '+warrior.health()+' Health last turn: '+this.health+'. Direction: '+this.direction+'. Needs Healing: '+this.needsHealing)

    // TODO only makes sense if I am facing forward/East at the start of the turn. 
    // TODO write check for direction to ensure output is accurate after having changed direction in a prior turn
    const walls = [
      warrior.feel('left').isWall() ? 'North' : null,
      warrior.feel('forward').isWall() ? 'East' : null,
      warrior.feel('right').isWall() ? 'South' : null,
      warrior.feel('backward').isWall() ? 'West' : null
    ]

    // warrior.feel().getLocation => x,y coordinates of the next room over
    // -1 to the x coord to correct for it being the next room over (and there not being a warrior.getLocation() for the current room)
    // warrior.feel().isEmpty() => no room = nothing, true or false otherwise
    warrior.think('\tLocation [x,y]: [' + (warrior.feel('forward').getLocation()[0] - 1) + ',' + warrior.feel('forward').getLocation()[1] + ']. Walls: ' + walls + '. Forward empty: '+warrior.feel('forward').isEmpty() + '. Backward empty: '+warrior.feel('backward').isEmpty())
    
    // roomsAhead arrays consist of the next 3 rooms in each direction left N, forward E, right S, backward W
    // Each of the three items in roomsAhead contain the result of warrior.feel() for that room 
    const roomsAhead = [
      warrior.feel('left').isWall() ? null : warrior.look('left'),
      warrior.feel('forward').isWall() ? null : warrior.look('forward'),
      warrior.feel('right').isWall() ? null : warrior.look('right'),
      warrior.feel('backward').isWall() ? null : warrior.look('backward')
    ]

    warrior.think(roomsAhead[0] === null) // => true when there is a wall and thus no room that way

    // Check your surroundings, for each of the cardinal directions...
    for(let i=0; i<roomsAhead.length; i++) {
      let dir
      i === 0 ? dir = 'North' : null
      i === 1 ? dir = 'West' : null
      i === 2 ? dir = 'South' : null
      i === 3 ? dir = 'East' : null

      warrior.think('\tchecking direction '+dir+'. '+roomsAhead[i])

      // If it is not an empty direction/room
      if (roomsAhead[i] !== null) {

        // Object.keys(warrior.feel()) => getLocation,getUnit,isEmpty,isStairs,isUnit,isWall
        // Object.keys(item) => same as above
        roomsAhead[i].forEach(item => {
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

        // Object.keys(warrior.feel().getUnit()) => isHostile,isFriendly,isPlayer,isWarrior,isBound,isUnderEffect

        const one = roomsAhead[i][0].getUnit(),
              two = roomsAhead[i][1].getUnit(),
              three = roomsAhead[i][2].getUnit()

        // If there is an enemy two or three squares away...
        if ( ((two !== undefined) && two.isHostile()) || ((three !== undefined) && three.isHostile()) ) {
          // But also a friendly one or two squares away
          if ( ((one !== undefined) && one.isFriendly()) || ((two !== undefined) && two.isFriendly()) ) {
            // ...do nothing
          } else {
            // TODO if the enemy is in front of me...
            // Shoot the enemy
            warrior.shoot()
            this.health = warrior.health() 
            return
            // TODO else if the enemy is behind me, turn around
          }
        }

      } //end of if not null room
    } //end of for

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
    if (warrior.health() < 8) {
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

    
    // Adjacent unit Logic

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
