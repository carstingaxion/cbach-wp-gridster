jQuery(function($){ 

}); 



jQuery(document).ready(function($) {

/*********************************************************************************************************************************************
 *  CPT Gridster post.php 
 ********************************************************************************************************************************************/




    /**
     *  Define our defaults
     *  
     *  @since    1.0
     *  
     */
    var gridster;
    var grid_size_x = parseInt( gridster_frontend.widget_base_width );
    var grid_size_y = parseInt( gridster_frontend.widget_base_height );    
    var grid_margin_x = parseInt( gridster_frontend.widget_margin_x );
    var grid_margin_y = parseInt( gridster_frontend.widget_margin_y );    
/*
    var max_size_x = parseInt( gridster_frontend.max_size_x );
    var max_size_y = parseInt( gridster_frontend.max_size_y );    
*/    
    



    /**
     *  Setup gridster
     *  
     *  @see    http://gridster.net/docs/
     *  
     *  @since  1.0
     *  
     *  @todo
                          
     *  
     */                            
    gridster = $('.gridster').gridster({
        widget_margins: [grid_margin_x, grid_margin_y],
        widget_base_dimensions: [grid_size_x, grid_size_y],
/*
        min_cols: gridster_frontend.min_cols,
        min_rows: gridster_frontend.min_rows,
        extra_cols: gridster_frontend.extra_cols,        
        extra_rows: gridster_frontend.extra_rows,
        max_size_x: max_size_x,
        max_size_y: max_size_y,
*/          
        avoid_overlapped_widgets: true,
    }).data('gridster');


     
     
         
    /**
     *  Load saved widgets from localized string
     *  
     *  @since    1.0
     *  
     */
    $.fn.LoadWidgetsOnStart = function () {
/*    
        // get saved data
        var data = gridster_frontend.layout;
    
        if ( data == '' || data == [] )
            return;
        
        // create object from string
        var objects = JSON.parse( data );
        
        // iterate over all objects
        $( objects ).each( function() {

            var o = $(this)[0];
    
            // prepare HTML for new widget
            var widget_html = $('<li>').attr('data-post_id', o.id ).html( o.html );
            
            // add widget to workbench
            gridster.add_widget( widget_html, o.size_x, o.size_y, o.col, o.row );
            
        });
*/
        // remove default gridster body_class and 
        // replace it with the loaded class
        $('body').removeClass('gridster-not-loaded').addClass('gridster-loaded');
    }
    $.fn.LoadWidgetsOnStart();
    


    /**
     *  Disable dragging of widgets
     *  
     *  @since    1.0
     *  
     */
    gridster.disable();                             


                            
});