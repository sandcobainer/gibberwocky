!function() {

var CodeMirror = require( 'codemirror' )

require( '../node_modules/codemirror/mode/javascript/javascript.js' )

var Gibber = {
  Communication: require( './communication.js' ),
  codemirror: null,
  max: null,
  codeMarkup: require( './codeMarkup.js' ),
  MIDI: require( './midi.js' ),
  test: function() { console.log('test') },
  init: function() {
    this.max = window.max
    this.createCodeMirror()
    this.Communication.init( 0,0 )
  },
  createCodeMirror: function() {
    CodeMirror.keyMap.gibber = this.keymap
    this.codemirror = CodeMirror( document.body, { mode:"javascript", keyMap:'gibber', autofocus:true }) 
  },
  log: function() {
    var args = Array.prototype.slice.call( arguments, 0 )
    //window.max.outlet( 'test' ) // args.join(' | ' ) )
  },
  keymap : {
    fallthrough:'default',
    'Ctrl-Enter': function( cm ) {
      try {
        var selectedCode = Gibber.getSelectionCodeColumn( Gibber.codemirror, false )

        //eval( selectedCode.code )
        //window.open( 'maxmessage:code/'+selectedCode.code )
        
        console.log( selectedCode.code )

        Gibber.flash( Gibber.codemirror, selectedCode.selection )

        Gibber.Communication.send( selectedCode.code )

//        Gibber.codeMarkup.process( selectedCode.code, selectedCode.selection )
      } catch (e) {
        console.log("ERROR")
      }
    }
  },
 	getSelectionCodeColumn : function( cm, findBlock ) {
		var pos = cm.getCursor(), 
				text = null
 
  	if( !findBlock ) {
      text = cm.getDoc().getSelection()

      if ( text === "") {
        text = cm.getLine( pos.line )
      }else{
        pos = { start: cm.getCursor('start'), end: cm.getCursor('end') }
        //pos = null
      }
    }else{
      var startline = pos.line, 
          endline = pos.line,
          pos1, pos2, sel
    
      while ( startline > 0 && cm.getLine( startline ) !== "" ) { startline-- }
      while ( endline < cm.lineCount() && cm.getLine( endline ) !== "" ) { endline++ }
    
      pos1 = { line: startline, ch: 0 }
      pos2 = { line: endline, ch: 0 }
    
      text = cm.getRange( pos1, pos2 )

      pos = { start: pos1, end: pos2 }
    }

    if( typeof pos.start === 'undefined' ) {
      var lineNumber = pos.line,
          start = 0,
          end = text.length

      pos = { start:{ line:start, ch:0 }, end:{ line:start, ch: end } }
    }
		
    //GE.Keymap.flash(cm, pos)
		
		return { selection: pos, code: text }
	},
  flash: function(cm, pos) {
    var sel,
        cb = function() { sel.clear() }
  
    if (pos !== null) {
      if( pos.start ) { // if called from a findBlock keymap
        sel = cm.markText( pos.start, pos.end, { className:"CodeMirror-highlight" } );
      }else{ // called with single line
        sel = cm.markText( { line: pos.line, ch:0 }, { line: pos.line, ch:null }, { className: "CodeMirror-highlight" } )
      }
    }else{ // called with selected block
      sel = cm.markText( cm.getCursor(true), cm.getCursor(false), { className: "CodeMirror-highlight" } );
    }
  
    window.setTimeout(cb, 250);
  },
}

module.exports = Gibber

}()
