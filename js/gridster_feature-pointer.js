jQuery(document).ready( function($) {
    // loop over all pointers    
    $.each( gridster_Pointers, function(i) {
        gridster_open_pointer(i);
    });    
    function gridster_open_pointer(i) {
        pointer = gridster_Pointers[i];
        // define dismiss-callback
        options = $.extend( pointer.options, {
            close: function() {
                $.post( ajaxurl, {
                    pointer: pointer.pointer_id,
                    action: 'dismiss-wp-pointer'
                });
            }
        });
        // append pointer to DOM
        $(pointer.target).pointer( options ).pointer('open');
    }   
});