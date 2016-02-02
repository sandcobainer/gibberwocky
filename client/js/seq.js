'use strict';

var Queue = require( './priorityqueue.js' )

let seqclosure = function( Gibber ) {

  let proto = {
    create( _values, _timings, _key, _object ) {
      let seq = Object.create( this )

      Object.assign( seq, {
        phase: 0,
        running:false,
        values: _values,
        timings: _timings,
        object: _object || null,
        key: _key,
      })
      
      seq.init()
      
      return seq
    },
    
    init() {
      if( !Array.isArray( this.values  ) ) this.values  = [ this.values ] 
      if( !Array.isArray( this.timings ) ) this.timings = [ this.timings ]

      /* TODO: if( ! this.values instanceof Gibber.Pattern )  */ this.values  = Gibber.Pattern.apply( null, this.values  )
      /* TODO: if( ! this.timings instanceof Gibber.Pattern ) */ this.timings = Gibber.Pattern.apply( null, this.timings ) 
    },

    externalMessages: {
      note( number, beat, beatOffset ) {
        // arguments is a max message, as space-delimited strings and numbers. t is timestamp within beat 0..1
        // let msgstring = "add " + beat + " " + t + " " + n + " " + v + " " + d

        return 'add ' + beat + ' ' +  beatOffset + ' ' + number 
      }
    },

    start() {
      if( this.running ) return
      this.running = true
      
      Gibber.Scheduler.addMessage( this, 0 )     
      
      return this
    },

    stop() {
      this.running = false
    },

    tick( scheduler, beat, beatOffset ) {
      if( !this.running ) return
      
      let value = null
 
      // call method or anonymous function immediately
      if( this.externalMessages[ this.key ] !== undefined ) {
        
        value = this.values()
        if( typeof value === 'function' ) value = value()

        let msg = this.externalMessages[ this.key ]( value, beat, beatOffset )

        scheduler.msgs.push( msg )
      
      } else { // schedule internal method / function call
        
        value = this.values()
        if( typeof value === 'function' ) {
          value = value() // also executes anonymous functions
        }

        if( this.object && this.key ) {
          
          if( typeof this.object[ this.key ] === 'function' ) {
            this.object[ this.key ]( value )
          }else{
            this.object[ this.key ] = value
          }

        }
      }

      // pick a new timing and schedule tick
      let nextTime = this.timings()

      if( typeof nextTime === 'function' ) nextTime = nextTime()

      Gibber.Scheduler.addMessage( this, nextTime )
    },
  }

  proto.create = proto.create.bind( proto )

  return proto.create

}

module.exports = seqclosure