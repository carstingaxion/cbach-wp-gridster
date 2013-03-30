
(function() {
	tinymce.create('tinymce.plugins.gridster_shortcode', {

		init : function(ed, url) {
			var t = this;

			t.url = url;
			// create edit / delete handler Buttons
      t._createButtons();
      			
			//replace shortcode before editor content set
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
				if (o.get)
					o.content = t._get_gridster_shortcode(o.content);
			});
      
			// Register commands for shortcode change modal
			ed.addCommand('gridster_shortcode_replace_modal', function() {
				ed.windowManager.open({
//					file : url + '/tinymce_gridster_shortcode_modal.php', // file that contains HTML for our modal window
          file: ajaxurl + '?action=gridster_edit_shortcode_in_new_window_ajax',
//          id: 'gridster_tinymce-modal',
					width : 480, 
					height : 240,
//					height : 'auto',
//					wpDialog : true,
					title : ed.getLang('gridster_shortcode.popupTitle'), 
					inline : 1,
				}, {
					plugin_url : url
				});
			});
      
			// Register commands for new page to edit shortcode
			ed.addCommand('gridster_edit_shortcode_in_new_window', function() {
//          window.open('/wp-admin/post.php?post=8016&action=edit', '_blank').focus();
			}); 

			// Test try AJAX
			ed.addCommand('gridster_edit_shortcode_in_new_window_ajax', function() {
                ed.execCommand("gridster_edit_shortcode_in_new_window_ajax", false, false);
                jQuery.post(ajaxurl, {action:'gridster_edit_shortcode_in_new_window_ajax'}, function(html){
                     jQuery('#gridster_tinymce-modal').html( html );
                     console.log( html );
                });
			}); 
      
			// Register TinyMCE button
			ed.addButton( 'gridster_shortcode', {
          title : ed.getLang('gridster_shortcode.buttonTitle'), 
          cmd : 'gridster_shortcode_replace_modal', 
/*
// http://redconservatory.com/blog/tinymce-modal-window-in-wordpress/
          onclick : function() {
              tb_show("", url + "/tinymce_gridster_shortcode_modal.php");
              tinymce.DOM.setStyle(["TB_overlay", "TB_window", "TB_load"], "z-index", "999999")
          },
*/
/*
          onclick : function() {
              ed.execCommand("gridster_edit_shortcode_in_new_window_ajax", false, false);
          }  
*/                  
      });
      
			ed.onMouseDown.add(function(ed, e) {
				if ( e.target.nodeName == 'IMG' && ed.dom.hasClass(e.target, 'gridsterShortcodeGUI') ) {
				  ed.plugins.gridster_shortcode._hideButtons();
					ed.plugins.wordpress._showButtons(e.target, 'gridster_sr_btns');
				}
			}); 
      
			// popup buttons for images and the gallery
			ed.onInit.add(function(ed) {
				tinymce.dom.Event.add(ed.getWin(), 'scroll', function(e) {
				ed.plugins.gridster_shortcode._hideButtons();
				});
				tinymce.dom.Event.add(ed.getBody(), 'dragstart', function(e) {
				ed.plugins.gridster_shortcode._hideButtons();
				});
			});

			ed.onBeforeExecCommand.add(function(ed, cmd, ui, val) {
				ed.plugins.gridster_shortcode._hideButtons();
			});

			ed.onSaveContent.add(function(ed, o) {
				ed.plugins.gridster_shortcode._hideButtons();
			});

			ed.onMouseDown.add(function(ed, e) {
				if ( e.target.nodeName != 'IMG' )
				ed.plugins.gridster_shortcode._hideButtons();
			});

			ed.onKeyDown.add(function(ed, e){
				if ( e.which == tinymce.VK.DELETE || e.which == tinymce.VK.BACKSPACE )
				ed.plugins.gridster_shortcode._hideButtons();
			});           
      
		},

		_do_gridster_shortcode : function(co) {
      var t = this;
			return co.replace(/\[gridster([^\]]*)\]/g, function(a,b){
//				return '<img src="' + t.url + '/img/t.gif" class="gridsterShortcodeGUI mceItem" title="[gridster'+tinymce.DOM.encode(b)+']" data-gridster_shortcode="gridster'+tinymce.DOM.encode(b)+'" />';
				return '<img src="' + t.url + '/img/t.gif" class="gridsterShortcodeGUI mceItem" title="gridster'+tinymce.DOM.encode(b)+'" />';
			});
		},

		_get_gridster_shortcode : function(co) {

			function getAttr(s, n) {
				n = new RegExp(n + '=\"([^\"]+)\"', 'g').exec(s);
				return n ? tinymce.DOM.decode(n[1]) : '';
			};

			return co.replace(/(?:<p[^>]*>)*(<img[^>]+>)(?:<\/p>)*/g, function(a,im) {
				var cls = getAttr(im, 'class');

				if ( cls.indexOf('gridsterShortcodeGUI') != -1 )
//					return '<p>['+tinymce.trim(getAttr(im, 'data-gridster_shortcode'))+']</p>';
					return '<p>['+tinymce.trim(getAttr(im, 'title'))+']</p>';

				return a;
			});
		},


		_createButtons : function() {
			var t = this, ed = tinymce.activeEditor, DOM = tinymce.DOM, editButton, dellButton, isRetina;

			if ( DOM.get('gridster_sr_btns') )
				return;

			isRetina = ( window.devicePixelRatio && window.devicePixelRatio > 1 ) || // WebKit, Opera
				( window.matchMedia && window.matchMedia('(min-resolution:130dpi)').matches ); // Firefox, IE10, Opera

			DOM.add(document.body, 'div', {
				id : 'gridster_sr_btns',
				style : 'display:none;'
			});



			changeButton = DOM.add('gridster_sr_btns', 'img', {
				src : isRetina ? t.url+'/img/change-2x.png' : t.url+'/img/change.png',
				id : 'gridster_changeShortcode',
				width : '24',
				height : '24',
				title : ed.getLang('gridster_shortcode.changeButton')
			});

			tinymce.dom.Event.add(changeButton, 'mousedown', function(e) {
				var ed = tinymce.activeEditor;
				ed.execCommand("gridster_shortcode_replace_modal");
				ed.plugins.gridster_shortcode._hideButtons();
			});



			editButton = DOM.add('gridster_sr_btns', 'img', {
				src : isRetina ? t.url+'/img/edit-2x.png' : t.url+'/img/edit.png',
				id : 'gridster_editShortcode',
				width : '24',
				height : '24',
				title : ed.getLang('gridster_shortcode.editButton')
			});

			tinymce.dom.Event.add(editButton, 'mousedown', function(e) {
				var ed = tinymce.activeEditor;
				ed.execCommand("gridster_edit_shortcode_in_new_window");
				ed.plugins.gridster_shortcode._hideButtons();
			});



			dellButton = DOM.add('gridster_sr_btns', 'img', {
				src : isRetina ? t.url+'/img/delete-2x.png' : t.url+'/img/delete.png',
				id : 'gridster_delShortcode',
				width : '24',
				height : '24',
				title : ed.getLang('gridster_shortcode.dellButton')
			});

			tinymce.dom.Event.add(dellButton, 'mousedown', function(e) {
				var ed = tinymce.activeEditor, el = ed.selection.getNode();

				if ( el.nodeName == 'IMG' && ed.dom.hasClass(el, 'gridsterShortcodeGUI') ) {
					ed.dom.remove(el);

					ed.execCommand('mceRepaint');
					ed.dom.events.cancel(e);
				}

				ed.plugins.gridster_shortcode._hideButtons();
			});
		},

		_hideButtons : function() {
			var DOM = tinymce.DOM;
			DOM.hide( DOM.select('#gridster_sr_btns') );
		},

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
