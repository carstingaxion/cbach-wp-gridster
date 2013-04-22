var GridsterModalDialog = {
	init : function(ed) {
		// our tinyMCE instance
    GridsterModalDialog.local_ed = ed;
	},

	insert : function insertButton(ed) {
    
    // fallback for none selected content 
    var sel_text = 0;
    // we have some text or a gridster shortcode selected
    if (ed.selection.getContent()) {
        sel_text = 1;
    }
    // get all radio inputs
    var radios = document.getElementsByName('gridster_choose_shortcode_list');
    // find checked one
    for (var i = 0, length = radios.length; i < length; i++) {
        if (radios[i].checked) {
            var dummy = radios[i].value;
        }
    }
    // replace selected content with chosen shortcode
    if (sel_text) {
        tinyMCE.execCommand('mceReplaceContent', false, dummy );
    // or add shortcode to the cursor position
    } else {
        tinyMCE.execCommand('mceInsertContent', false, dummy );
    }
 
		// Close modal
		tinyMCEPopup.close();
	}
  
};
tinyMCEPopup.onInit.add( GridsterModalDialog.init, GridsterModalDialog );
 
