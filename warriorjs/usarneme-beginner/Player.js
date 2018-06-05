class Player {
  constructor() {
    this.health = 20,
    this.direction = 'forward',
    this.needsHealing = false,
    this.firstTurn = true,
    this.seenStairs = false,
    this.xCoord,
    this.yCoord
  }

  // Enemy is in front: 
    // IF my x location is less than the enemy's x coord AND if I am facing forward
    // OR
    // IF my x location is greater than the enemy's x coord AND if I am face backward
  amIFacingTheEnemyUnit(enemyRoom, warrior) {
    // warrior.think('\tX coord: '+this.xCoord+'. Enemy x coord: '+enemyRoom.getLocation()[0]+'. Facing: '+this.direction)
    if ( (this.xCoord < enemyRoom.getLocation()[0]) && (this.direction === 'forward') ) {
      return true
    }
    if ( (this.xCoord > enemyRoom.getLocation()[0]) && (this.direction === 'backward') ) {
      return true
    }
    return false
  }

  playTurn(warrior) {
    // Set location (using left so you don't have to offset x coordinate based on direction you are facing/etc.)
    this.xCoord = warrior.feel('left').getLocation()[0]

    if (this.firstTurn) {
      this.direction = 'backward'
      warrior.pivot()
      this.firstTurn = false
      this.health = warrior.health() 
      return
    }

    // if this is my first time seeing the stairs...
    // if (!this.seenStairs) {
    //   // turn around and make sure the level is cleared before exiting
    //   if (warrior.feel().isStairs()) {
    //     this.seenStairs = true
    //     warrior.pivot()
    //     this.direction === 'forward' ? this.direction = 'backward' : this.direction = 'forward'
    //     this.health = warrior.health() 
    //     return
    //   }
    // }

    // Object.keys(this) => health, direction. needsHealing
    // warrior.think('\tHealth: '+warrior.health()+' Health last turn: '+this.health+'. Direction: '+this.direction+'. Needs Healing: '+this.needsHealing)

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
    // warrior.think('\tLocation [x,y]: [' + this.xCoord + ',' + warrior.feel('forward').getLocation()[1] + ']. Walls: ' + walls + '. Forward empty: '+warrior.feel('forward').isEmpty() + '. Backward empty: '+warrior.feel('backward').isEmpty())
    
    // roomsAhead arrays consist of the next 3 rooms in each direction left N, forward E, right S, backward W
    // Each of the three items in roomsAhead contain the result of warrior.feel() for that room 
    // Object.keys(warrior.feel()) => getLocation,getUnit,isEmpty,isStairs,isUnit,isWall
    const roomsAhead = [
      warrior.feel('left').isWall() ? null : warrior.look('left'),
      warrior.feel('forward').isWall() ? null : warrior.look('forward'),
      warrior.feel('right').isWall() ? null : warrior.look('right'),
      warrior.feel('backward').isWall() ? null : warrior.look('backward')
    ]
    // // warrior.think(roomsAhead[0] === null) // => true when there is a wall and thus no room that way

    // Check your surroundings, for each of the cardinal directions...
    for(let i=0; i<roomsAhead.length; i++) {
      let dir
      i === 0 ? dir = 'North' : null
      i === 1 ? dir = 'Forward' : null
      i === 2 ? dir = 'South' : null
      i === 3 ? dir = 'Backward' : null

      // warrior.think('\tchecking direction '+dir+'. '+roomsAhead[i])

      // If it is not an empty direction/room
      if (roomsAhead[i] !== null) {

        // Object.keys(warrior.feel()) => getLocation,getUnit,isEmpty,isStairs,isUnit,isWall
        // Object.keys(item) => same as above
        // roomsAhead[i].forEach(item => {
        //   warrior.think('\t\tRoom location: [' + item.getLocation() +
        //   '] Empty: ' + item.isEmpty() + 
        //   '. Stairs: ' + item.isStairs() +
        //   '. Wall: ' + item.isWall() +
        //   '. Unit: ' + item.isUnit()
        // )
        //   if (item.isUnit()) {
        //     const unit = item.getUnit()
        //     // warrior.think('\t\tUnit at '+ item.getLocation() +'. Friendly: '+unit.isFriendly()+'. Player: '+unit.isPlayer()+'. Warrior: '+unit.isWarrior()+'. Bound: '+unit.isBound()+' Under Effect: '+unit.isUnderEffect()+'.')
        //   }
        // })

        // Each of the four directions (i) has 3 adjacent rooms (0,1,2)
        const firstAdjacentRoom = roomsAhead[i][0],
              secondAdjacentRoom = roomsAhead[i][1],
              thirdAdjacentRoom = roomsAhead[i][2]

        const firstRoomOccupied = (firstAdjacentRoom.getUnit() !== undefined),
              secondRoomOccupied = (secondAdjacentRoom.getUnit() !== undefined),
              thirdRoomOccupied = (thirdAdjacentRoom.getUnit() !== undefined)

        // If there is an enemy unit three squares away
        if (thirdRoomOccupied && thirdAdjacentRoom.getUnit().isHostile()) {
          // warrior.think('\tthird adjacent room occupied with hostile unit')
          // If the rooms (1&2) between the unit in the third room are not occupied...
          if (!firstRoomOccupied && !secondRoomOccupied) {
            // If we've made it this far, there is an enemy nearby and no friendly unit in the way
            // Ensure I am facing the enemy
            if (!this.amIFacingTheEnemyUnit(thirdAdjacentRoom, warrior)) {
              // The enemy is behind me, pivot to turn around
              // warrior.think('\t\tpivoting from '+this.direction)
              this.direction === 'forward' ? this.direction = 'backward' : this.direction = 'forward'
              this.health = warrior.health() 
              warrior.pivot()
              return
            } else {
              // Shoot the enemy
              // warrior.think('\t\tshooting')
              warrior.shoot()
              this.health = warrior.health() 
              return
            }
          } // else one of the second or third rooms adjacent are occupied (continue doing nothing until below adjacent unit logic)
        }

        // If there is an enemy unit two squares away
        if (secondRoomOccupied && secondAdjacentRoom.getUnit().isHostile()) {
          // warrior.think('\tsecond adjacent room occupied with hostile unit')
          // If the next over room is not occupied...
          if (!firstRoomOccupied) {
            // If we've made it this far, there is an enemy nearby and no friendly unit in the way
            // Ensure I am facing the enemy
            if (!this.amIFacingTheEnemyUnit(secondAdjacentRoom, warrior)) {
              // The enemy is behind me, pivot to turn around
              // warrior.think('\t\tpivoting from '+this.direction)
              this.direction === 'forward' ? this.direction = 'backward' : this.direction = 'forward'
              this.health = warrior.health() 
              warrior.pivot()
              return      
            } else {
              // Shoot the enemy
              // warrior.think('\t\tshooting ')
              warrior.shoot()
              this.health = warrior.health() 
              return
            }
          } // else the first room adjacent is occupied (continue doing nothing until below adjacent unit logic)
        }

      } //end of if not null room
    } //end of for

    // Direction logic 
    // if a wall is encountered, change direction
    if (warrior.feel().isWall()) {
      // // warrior.think('there is a wall '+this.direction)
      this.direction === 'forward' ? this.direction = 'backward' : this.direction = 'forward'
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
        this.direction === 'forward' ? this.direction = 'backward' : this.direction = 'forward'
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
    
    // Adjacent room with a unit
    // Attack enemy or rescue adjacent square captive
    if (warrior.feel().isUnit()) {
      // assigned to variable for ease of reading code
      const unit = warrior.feel().getUnit()
      // warrior.think('\tunit ahead. \tFriendly: '+unit.isFriendly()+'.\tPlayer: '+unit.isPlayer()+'.\t Warrior: '+unit.isWarrior()+'.\tBound: '+unit.isBound()+'\tUnder Effect: '+unit.isUnderEffect()+'.')
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

    // Default behavior to walking 
    warrior.walk() 
    this.health = warrior.health()
    return
  } // end of playTurn
}
