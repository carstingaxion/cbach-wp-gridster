(function() {
  	tinymce.create('tinymce.plugins.gridster_shortcode', {
    
    		init : function(ed, url) {
      			var t = this;
            t.url = url;
      			
            // create edit / delete handler Buttons
            t._createButtons();
            			
      			//replace shortcode before editor content is set
      			ed.onBeforeSetContent.add(function(ed, o) {
      				  o.content = t._do_gridster_shortcode(o.content);
      			});
      			
      			//replace shortcode as its inserted into editor (which uses the exec command)
      			ed.onExecCommand.add(function(ed, cmd) {
      			    if (cmd ==='mceInsertContent'){
      					tinyMCE.activeEditor.setContent( t._do_gridster_shortcode(tinyMCE.activeEditor.getContent()) );
      				}
      			});
            
      			//replace the image back to shortcode on save
      			ed.onPostProcess.add(function(ed, o) {
        				if (o.get) {
        				    o.content = t._get_gridster_shortcode(o.content);                
                }
      			});
            
      			// Register commands for shortcode change modal
      			ed.addCommand('ajax_gridster_shortcode_update_modal', function( u, v ) {
        				ed.windowManager.open({
                    file: ajaxurl + '?action=ajax_gridster_shortcode_update_modal&nonce=' + ed.getLang('gridster_shortcode.AjaxNonce') + '&selected=' + v,
          					width : 300, 
          					height : 240,
          					title : ed.getLang('gridster_shortcode.popupTitle'), 
          					inline : 1
        				}, {
        				    plugin_url : url
        				});
      			});
      			
            // Register commands for editing the gridster of the current shortcode
      			ed.addCommand('gridster_edit_current_gridster', function() {
        				var ed = tinymce.activeEditor, el = ed.selection.getNode();
                // trigger WP autosave
                //autosave();
   
                // is this a gridster shortcode ?
        				if ( el.nodeName == 'IMG' && ed.dom.hasClass(el, 'gridsterShortcodeGUI') ) {
                    // extract gridster post_ID from shortcode attribute 
                    var gridster_id = ed.plugins.gridster_shortcode._get_gridster_id( el );
                    // get base URL
                    var path_array = ajaxurl.split( 'admin-ajax.php' );
                    var admin_url = path_array[0];
                    // create edit url with our gridster id as parameter
                    var edit_url = 'post.php?post=' + gridster_id + '&action=edit';
                    // go on and start redirect
                    window.top.location.href = admin_url+edit_url;
        				}
                
      			});
                        
      			// Register TinyMCE button
      			ed.addButton( 'gridster_shortcode', {
                title : ed.getLang('gridster_shortcode.buttonTitle'), 
                cmd : 'ajax_gridster_shortcode_update_modal' 
            });
            
            // 
      			ed.onMouseDown.add(function(ed, e) {
        				if ( e.target.nodeName == 'IMG' && ed.dom.hasClass(e.target, 'gridsterShortcodeGUI') ) {
          				  ed.plugins.gridster_shortcode._hideButtons();
          					ed.plugins.wordpress._showButtons(e.target, 'gridster_sr_btns');
        				}
      			}); 
            
      			// hide buttons for edit & delete handlers on 
            // multiple events
      			ed.onInit.add(function(ed) {
        				tinymce.dom.Event.add(ed.getWin(), 'scroll', function(e) {
        				    ed.plugins.gridster_shortcode._hideButtons();
        				});
        				tinymce.dom.Event.add(ed.getBody(), 'dragstart', function(e) {
        				    ed.plugins.gridster_shortcode._hideButtons();
        				});
      			});
            // when some other action is triggered
      			ed.onBeforeExecCommand.add(function(ed, cmd, ui, val) {
      				  ed.plugins.gridster_shortcode._hideButtons();
      			});
            // on save 
      			ed.onSaveContent.add(function(ed, o) {
      				  ed.plugins.gridster_shortcode._hideButtons();
      			});
            // on mouse click
      			ed.onMouseDown.add(function(ed, e) {
      				  if ( e.target.nodeName != 'IMG' ) {
      				      ed.plugins.gridster_shortcode._hideButtons();                
                }
      			});
            // on key press
      			ed.onKeyDown.add(function(ed, e){
        				if ( e.which == tinymce.VK.DELETE || e.which == tinymce.VK.BACKSPACE ) {
        				    ed.plugins.gridster_shortcode._hideButtons();                
                }
      			});           
    		},
    
        // replace [gridster]-Shortcode with placeholder image
    		_do_gridster_shortcode : function(co) {
            var t = this;
      			return co.replace(/\[gridster([^\]]*)\]/g, function(a,b){
      			   return '<img src="' + t.url + '/img/t.gif" class="gridsterShortcodeGUI mceItem" title="gridster'+tinymce.DOM.encode(b)+'" />';
      			});
    		},
    
        // replace placeholder-image with [shortcode] and wrap int in paragraph
    		_get_gridster_shortcode : function(co) {
      
      			function getAttr(s, n) {
        				n = new RegExp(n + '=\"([^\"]+)\"', 'g').exec(s);
        				return n ? tinymce.DOM.decode(n[1]) : '';
      			};
      
      			return co.replace(/(?:<p[^>]*>)*(<img[^>]+>)(?:<\/p>)*/g, function(a,im) {
        				var cls = getAttr(im, 'class');
        
        				if ( cls.indexOf('gridsterShortcodeGUI') != -1 ) {
        					return '<p>['+tinymce.trim(getAttr(im, 'title'))+']</p>';                
                }
        				return a;
      			});
    		},
        
        //
        _get_gridster_id : function( el ) {
            
            // find attr inside encoded shortcode of title-Attribute 
      			function getAttr(s, n) {
        				n = new RegExp(n + '=\&quot\;([0-9]+)\&quot\;').exec(s);
                return n ? tinymce.DOM.decode(n[1]) : '';
      			};

            // clone image element
            var clone = el.cloneNode(true);
            // create temporary parent element
            var tmp = document.createElement("div");
            // append clone to parent
            tmp.appendChild(clone);
            // get string representation of element
            var stringed_el = tmp.innerHTML; 
            // get ID of gridster post from shortcode Attribute
            var gridster_id = getAttr(stringed_el, 'id');
            
            return gridster_id;
        },
    
        // Add Edit-Handler Buttons to DOM and add event-handlers
    		_createButtons : function() {
      			var t = this, ed = tinymce.activeEditor, DOM = tinymce.DOM, editButton, dellButton, isRetina;
      
      			if ( DOM.get('gridster_sr_btns') ) {
      			    return;            
            }
      
      			isRetina = ( window.devicePixelRatio && window.devicePixelRatio > 1 ) || ( window.matchMedia && window.matchMedia('(min-resolution:130dpi)').matches ); 
      
      			DOM.add(document.body, 'div', {
        				id : 'gridster_sr_btns',
        				style : 'display:none;'
      			});
      
            // Replace current shortcode
      			changeButton = DOM.add('gridster_sr_btns', 'img', {
        				src : isRetina ? t.url+'/img/change-2x.png' : t.url+'/img/change.png',
        				id : 'gridster_changeShortcode',
        				width : '24',
        				height : '24',
        				title : ed.getLang('gridster_shortcode.changeButton')
      			});
      			tinymce.dom.Event.add( changeButton, 'mousedown', function(e) {
        				var ed = tinymce.activeEditor, el = ed.selection.getNode();
                // is this a gridster shortcode ?
        				if ( el.nodeName == 'IMG' && ed.dom.hasClass(el, 'gridsterShortcodeGUI') ) {
                    // extract gridster post_ID from shortcode attribute 
                    var gridster_id = ed.plugins.gridster_shortcode._get_gridster_id( el );
            				// open Modal to pick gridster shortcode from list
                    ed.execCommand("ajax_gridster_shortcode_update_modal", false, gridster_id );
            				// hide Edit-handler-Buttons
                    ed.plugins.gridster_shortcode._hideButtons();                    
        				}
      			});
      
            // Edit gridster, used by the current shortcode
      			editButton = DOM.add('gridster_sr_btns', 'img', {
        				src : isRetina ? t.url+'/img/edit-2x.png' : t.url+'/img/edit.png',
        				id : 'gridster_editShortcode',
        				width : '24',
        				height : '24',
        				title : ed.getLang('gridster_shortcode.editButton')
      			});
      			tinymce.dom.Event.add( editButton, 'mousedown', function(e) {
        				var ed = tinymce.activeEditor;
        				ed.execCommand("gridster_edit_current_gridster");
        				// hide Edit-handler-Buttons
                ed.plugins.gridster_shortcode._hideButtons();
      			});
      
            // Delete Shortcode from content
      			dellButton = DOM.add('gridster_sr_btns', 'img', {
        				src : isRetina ? t.url+'/img/delete-2x.png' : t.url+'/img/delete.png',
        				id : 'gridster_delShortcode',
        				width : '24',
        				height : '24',
        				title : ed.getLang('gridster_shortcode.dellButton')
      			});
      			tinymce.dom.Event.add( dellButton, 'mousedown', function(e) {
        				var ed = tinymce.activeEditor, el = ed.selection.getNode();
                // is this a gridster shortcode ?
        				if ( el.nodeName == 'IMG' && ed.dom.hasClass(el, 'gridsterShortcodeGUI') ) {
        					// remove shortcode
                  ed.dom.remove(el);
                  // re-paint TinyMCE iframe with $post-content
        					ed.execCommand('mceRepaint');
        					ed.dom.events.cancel(e);
        				}
                // hide Edit-handler-Buttons
        				ed.plugins.gridster_shortcode._hideButtons();
      			});
    		},
    
        // Hide Edit-Handler-Buttons
    		_hideButtons : function() {
      			var DOM = tinymce.DOM;
      			DOM.hide( DOM.select('#gridster_sr_btns') );
    		},
    
        // plugin info
    		getInfo : function() {
      			return {
        				longname  : 'Gridster shortcode replace with user-friendly GUI',
        				author    : 'Carsten Bach',
        				authorurl : 'http://carsten-bach.de',
        				infourl   : 'https://github.com/carstingaxion/cbach-wp-gridster',
        				version   : '1.0'
      			};
    		}
  	});
  
  	tinymce.PluginManager.add('gridster_shortcode', tinymce.plugins.gridster_shortcode);
})();