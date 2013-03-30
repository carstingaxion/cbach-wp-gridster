jQuery(function($){ 



    /**
     *  Define our defaults
     *  
     *  @since    1.0
     *  
     */
    var gridster;
    var grid_size_x = parseInt( gridster_admin.widget_base_width );
    var grid_size_y = parseInt( gridster_admin.widget_base_height );    
    var grid_margin_x = parseInt( gridster_admin.widget_margin_x );
    var grid_margin_y = parseInt( gridster_admin.widget_margin_y );    
/*
    var max_size_x = parseInt( gridster_admin.max_size_x );
    var max_size_y = parseInt( gridster_admin.max_size_y );    
*/    
    $.fn.resizeBlock = function ( elmObj ) {

        var elmObj = $(elmObj);
        var w = elmObj.width() - grid_size_x;
        var h = elmObj.height() - grid_size_y;

        for (var grid_w = 1; w > 0; w -= (grid_size_x + (grid_margin_x * 2))) {
            grid_w++;
        }

        for (var grid_h = 1; h > 0; h -= (grid_size_y + (grid_margin_y * 2))) {
            grid_h++;
        }
        gridster.resize_widget(elmObj, grid_w, grid_h);
    }
    
    
    
    /**
     *  Update the hidden input field for our 
     *  serialized layout definitions     
     *  
     *  @since    1.0
     *  
     */
    $.fn.updateGridsterLayoutSettings = function (  ) {

        // get serialized array from gridster   
        var settings = gridster.serialize();
        // prepare Array of Objects for the text-input, 
        // later PHP and set value to hidden input
        $('input#gridster_layout').val( JSON.stringify(settings) );
        return;        
    }



    /**
     *  Define Options for jQuery UI Resizable Widget
     *  used for every gridster widget
     *  
     *  @since    1.0
     *  
     *  @see      http://api.jqueryui.com/resizable/
     *  
     */       
    var resizable_opts = {
        grid: [grid_size_x + (grid_margin_x * 2), grid_size_y + (grid_margin_y * 2)],
        animate: false,
        minWidth: grid_size_x,
        minHeight: grid_size_y,
    /*
        maxWidth: ( ( grid_size_x + (grid_margin_x * 2) ) * max_size_x ),
        maxHeight: ( ( grid_size_y + (grid_margin_y * 2) ) * max_size_y ),
        aspectRatio: gridster_admin.resizable_aspect_ratio,    
    */    
        containment: '.gridster ul',
        handles: 'se',
        autoHide: true,
        resize: function (event, ui) {
            // only if images exist, mark as "updating"
            if ( $(this).find('img').length ) {
                // mark widget as "in update progress"
                $(this).addClass('isUpdated');
            }
        },
        stop: function(event, ui) {
            var resized = $(this);
            setTimeout(function() {
                //re-calculate widget size
                $.fn.resizeBlock( resized );
                // only if images exist, go on and update html
                if ( $(resized).find('img').length ) {
                    // update widget html, to get best fitting image
                    $.fn.refreshWidgetHtml( resized.data().post_id, false, resized );
                }            
                // update layout settings
                $.fn.updateGridsterLayoutSettings(); 
            }, 300);
        }
    }



    /**
     *  Setup gridster
     *  
     *  @see    http://gridster.net/#documentation
     *  @see    http://gridster.net/docs/
     *  
     *  @since  1.0
     *  
     *  @todo
                          
     *  
     */                            
    gridster = $('.gridster ul').gridster({
        widget_margins: [grid_margin_x, grid_margin_y],
        widget_base_dimensions: [grid_size_x, grid_size_y],

/*
        min_cols: gridster_admin.min_cols,
        min_rows: gridster_admin.min_rows,
        extra_cols: gridster_admin.extra_cols,        
        extra_rows: gridster_admin.extra_rows,
        max_size_x: max_size_x,
        max_size_y: max_size_y,
*/          
        avoid_overlapped_widgets: true,
        // define parameter, returned by method "serialize_parameter"
        // that is called on every change inside the gridster workbench
        serialize_params: function($w, wgd) {
            // prepare widget HTML
            var w_html = $.trim( $('<div/>').text($($w).find('.admin-html-holder').html()).html() );
            return {
                size_x: wgd.size_x,
                size_y: wgd.size_y,                
                col: wgd.col,
                row: wgd.row,
                id: $($w).attr('data-post_id'),
                html: w_html
            };
        },
        draggable: {
            handle: '.move-handle',
            stop: function(event, ui) {
                    // update layout settings
                    $.fn.updateGridsterLayoutSettings();
            }
        },
        collision: {
            //
            on_overlap_start: function(collider_data) {
//                 console.log( collider_data );
            },
            //
            on_overlap_stop: function(collider_data) {
//                 console.log( collider_data );
            }            
        },        
    }).data('gridster');

    
                                   
    /**
     *  Setup the 'gridster' as a drop-area for post-<li>-s from widget-blocks
     *  and call the getter for the new widgets HTML     
     *  
     *  @see      http://jsfiddle.net/PdjLE/100/
     *  
     *  @since    1.0
     *  
     */     
    $( '.gridster' ).droppable({
        drop: function( event, ui ) {
            
            // get post->ID from rel-Attribute
            var post_id = $(ui.draggable).attr('rel');
            
            // write post->ID to post_meta hidden input,
            // so next time we're querying posts inside the widget-blocks
            // we can omit theese used post->IDs
            $.fn.updateQueryNotInField( post_id );
          
            // remove from widget-blocks list
            ui.helper.remove();
            
            // show loading-image and prevent manipulating gridster workbench
            $('#gridster_load-wrap').fadeIn();
            
            // get widget HTML via AJAX
            $.fn.refreshWidgetHtml( post_id, true );
          
        }
    });
    
    
    
    /**
     *  Refresh widgets HTML
     *  
     *  used on add_widget or resize_widget
     *  
     *  @since    1.0          
     *  
     */ 
    $.fn.refreshWidgetHtml = function( id, load_new = false, widget_object = null ) {

        // prepare options Array 
        var query_options = {
            
            // get $post-ID
            post_id:   id,
            
            // default widget size, as image filter dimensions
            widget_width: ( widget_object ) ? widget_object.width() : grid_size_x,
            widget_height:( widget_object ) ? widget_object.height() : grid_size_y,
            
        };
    
        // get HTML 
        $.ajax({
            type: 'GET',
            url: gridster_admin.ajaxUrl,
            dataType: 'html',
            data: ({ 
                // callback function, /plugins/cbach-wp-gridster/cbach-wp-gridster.php
                action: 'ajax_gridster_get_post',
                // security checking, Nonce
                nonce:    gridster_admin.ajaxNonce,
                // content options
                options: query_options, 
            }),
            success: function( data ){
    
                // no data
                if ( data == '-1' || data == '' || data == '0' || data == 'undefined' ) {
                
                   // get current content from loader paragraph
                   var current_loader_p = $('#gridster_loader p').html();
                   
                   $('#gridster_loader').addClass('error');
                   $('#gridster_loader p').text( gridster_admin.textAjaxLoadProblem );
                   
                    // hide loading-image and allow manipulating gridster workbench
                    $('#gridster_load-wrap').fadeOut( 5000, function() {

                        // remove Error class
                        $('#gridster_loader').removeClass('error');
                        
                        // reset content on loader paragraph
                        $('#gridster_loader p').html( current_loader_p );
                    });                     
                
                } else {
                    
                    // should we update or load completely new
                    if ( load_new === true ) {

                        // get & prepare HTML for new widget
                        var widget_html = $('<li>').attr('data-post_id', id ).html( data );                    
    
                        // make new widget resizable
                        widget_html.resizable( resizable_opts );
                        
                        // add UI elements to handle widget
                        //widget_html = $.fn.AddUiElemnts( widget_html );
                        widget_html.append( $.fn.AddUiElemnts( ) );
    
                        // add widget to workbench
                        gridster.add_widget( widget_html, 1, 1);
                        
                        // update layout settings
                        $.fn.updateGridsterLayoutSettings();
                        
                        // hide loading-image and allow manipulating gridster workbench
                        $('#gridster_load-wrap').fadeOut();
                    
                    // only refresh HTML
                    } else {
                        
                        // load new HTML inside gridster widget
                        $(widget_object).find('div.admin-html-holder').replaceWith( data );
                    
                        // remove "isUpdated" Class
                        $(widget_object).removeClass('isUpdated');
                    
                        // update layout settings
                        $.fn.updateGridsterLayoutSettings();                    
                    }
                    
                    // make content editable
                    $.fn.initJeditable();                    
                     
                }
            }
        }); 
    }; 



    /**
     *  Update the hidden input field for ommiting 
     *  post->IDs on next query in widget-blocks
     *  
     *  @since    1.0
     *  
     */
    $.fn.updateQueryNotInField = function ( post_id, remove = false ) {
        // cast the string as a number
        var id = parseInt( post_id );
        // get value from hidden input
        var query_not_in = $('input#gridster_query_posts_not_in').val();
        if ( remove !== false ) {
            // convert string tp array
            var query_not_in_array = query_not_in.split(',');
            // cast the string as a number
            query_not_in_array = query_not_in_array.map(function(v){ return parseInt(v)});
            // check if ID exists in array
            // and return array key of match
            var remove_index = query_not_in_array.indexOf(id);
            // if nothing matches, return
            if ( remove_index < 0 )
                return;
            // remove the match from the array
            query_not_in_array.splice(remove_index,1);
            // update the hidden input with new value
            $('input#gridster_query_posts_not_in').val( query_not_in_array.join(',') );            
            return;
        }
        // create regular expression to check if ID exists
        var re = new RegExp('(^|\\b)' + id + '(\\b|$)');        
        if (!re.test(query_not_in)) {
            var new_v = query_not_in + (query_not_in.length? ',' : '') + post_id;
            $('input#gridster_query_posts_not_in').val( new_v );
        }
        return;        
    }                              
    
    
    
    /**
     *  Add UI elements to new created gridster widgets
     *  
     *  @since    1.0
     *  
     */
    $.fn.AddUiElemnts = function ( ) {
    
        // create UI holder
        var meta_label = $('<div />').addClass('meta-label');
        
        // add move handle
        $('<span />').attr('title', gridster_admin.textMoveHandle ).text( gridster_admin.textMoveHandle ).addClass('ir move-handle').appendTo( meta_label );        
        
        // add deleter
        $('<span />').attr('title', gridster_admin.textDelete ).text( gridster_admin.textDelete ).addClass('ir delete-post').appendTo( meta_label );
        
        return meta_label;
    }                         
   
    
    
    /**
     *  Control Gridster during resizing
     *  
     *  @since    1.0
     *  
     *  @see      http://stackoverflow.com/a/9827114
     *  
     */      
    $(document).on({ mouseenter: function() {
            // disable dragging and re-layouting during the resize-event
            gridster.disable();
        }, mouseleave: function() {
            // re-enable dragging and re-layouting, when resizing ends
            gridster.enable();        
        }
    }, '.ui-resizable-handle'); 



    /**
     *  Prevent Links from being executed inside the workbench
     *  
     *  @since    1.0
     *  
     */    
    $(document).on('click', '.gridster li .admin-html-holder a', function (e) {
        e.preventDefault();     
    });
/*
    $('.gridster li .admin-html-holder').on('click', 'a', function (e) {
        e.preventDefault();
        e.stopPropagation();


console.log(e.target);



        e.preventBubble();
$(e.target).click();
        
console.log( $(this) );
console.log( e.target.type );
//        $(this).unbind(e);
//        $(this).unbind('click'); 
//        $(this).off('click');
       
        if ( e.target.type == 'textarea' ) {
        //$(e.taget).focus();

            return true;        
        
        }

    });
*/ 
/*
$(".gridster li .admin-html-holder a")
    .delegate('textarea', 'click', function(e){ e.stopImmediatePropagation(); console.log(e); })
    .click(function(e) { console.log(e); });        
*/    
//    $(document).off('click', '.gridster li .admin-html-holder a');    
    
    
    
    
    /**
     *  Delete post from gridster workbench
     *   
     *  @since   1.0
     *  
     */                         
    $('.delete-post').live( 'click', function(){
        $(this).parent().parent().hide('fast', function(){ 

            // cast data-attr as Integer
            var id = parseInt( $(this).data().post_id );
            
            // remove $post->ID from "query_not_in" input
            $.fn.updateQueryNotInField( id, true ); 
            
            // delete widget
            gridster.remove_widget( $(this) );
 
            // update layout settings
            $.fn.updateGridsterLayoutSettings();
        });
    });
    


    /**
     *  Make content editable
     *  using Jeditable library
     *  
     *  @since    1.0
     *  @see      http://www.appelsiini.net/projects/jeditable
     *  
     */                                  
     $.fn.initJeditable = function () {
         
         $('.gridster_edit').editable( function( value, settings ) { 
             // use this function instead of an own AJAX request
             return(value);
          }, {
             // text shown as title-Attrinute of editable content
             // can't be used because it appears in the output
             //tooltip: gridster_admin.JeditableToolTip,
             
             // Default action of when user clicks outside of editable area is to cancel edits. 
             // You can control this by setting onblur option. 
             // Possible values are: "cancel", "submit" and "ignore"
             onblur: 'submit',
             //onblur: 'ignore', // for debugging only
             
             // ommit whitespace before and after edited text
             // @see  http://stackoverflow.com/a/9087222
             data    : function(string) {return $.trim(string)},             
             
             // placeholder text for empty editable elements
             // set as empty, to keep frontend output clean
             // @see http://datatables.net/forums/discussion/5865/jeditable-and-default-click-to-edit/p1
             placeholder : '',
             
             // function triggered after submit succeeded
             callback: function(value, settings) {
    
                // update layout settings
                $.fn.updateGridsterLayoutSettings();      
             }             
         });
   
         $('.gridster_edit-area').editable( function( value, settings ) { 
             return(value);
          }, {
             type      : 'autogrow',
             cancel    : gridster_admin.JeditableCancel,
             submit    : gridster_admin.JeditableOk,
             
             // Default action of when user clicks outside of editable area is to cancel edits. 
             // You can control this by setting onblur option. 
             // Possible values are: "cancel", "submit" and "ignore"
             onblur: 'submit',
             //onblur: 'ignore', // for debugging only
             
             // ommit whitespace before and after edited text
             // @see  http://stackoverflow.com/a/9087222
             data    : function(string) {return $.trim(string)},
             
             // placeholder text for empty editable elements
             // set as empty, to keep frontend output clean
             // @see http://datatables.net/forums/discussion/5865/jeditable-and-default-click-to-edit/p1
             placeholder : '',
             
             //
             autogrow : {
                 lineHeight : 16,
                 minHeight  : 32
             },             
             
             // function triggered after submit succeeded
             callback: function(value, settings) {
    
                // update layout settings
                $.fn.updateGridsterLayoutSettings();      
             }               
         });    
        
        
        /**
         *  Add WordPress UI default styles to Jeditable form buttons
         *  
         *  @since    1.0
         *  
         */
        $('.gridster_edit-area').on( 'click', function(){
            $('button[type="submit"]').addClass('button-primary');
            $('button[type="cancel"]').addClass('button-secondary');         
        });
     }
     $.fn.initJeditable();
     
     
     
         
    /**
     *  Load saved widgets from hidden input
     *  
     *  @since    1.0
     *  
     */
    $.fn.LoadWidgetsOnStart = function () {
    
        // get saved data
        var data = $('input#gridster_layout').val();
    
        // stop here, if this is a new gridster
        if ( data == '' || data == [] )
            return false;
            
        // show loader
        $('#gridster_load-wrap').fadeIn();   
        
        // create object from string
        var objects = JSON.parse( data );
        
        // iterate over all objects
        $( objects ).each( function() {

            var o = $(this)[0];
    
            // prepare HTML for new widget
            var widget_html = $('<div>').addClass( 'admin-html-holder' ).html( o.html );                    
            widget_html = $('<li>').attr('data-post_id', o.id ).append( widget_html );            
            
            // make new widget resizable
            widget_html.resizable( resizable_opts );
            
            // add UI elements to handle widget
            //widget_html = $.fn.AddUiElemnts( widget_html );
            widget_html.append( $.fn.AddUiElemnts( ) );
    
            // add widget to workbench
            gridster.add_widget( widget_html, o.size_x, o.size_y, o.col, o.row );
            
        });
        // make content editable
        $.fn.initJeditable();
        // hide loader
        $('#gridster_load-wrap').fadeOut();   
    }
    
    
    
    /**
     *  Adjust Column view according to 
     *  window-width, meta_box-width or screen-preferences setting
     *  
     *  @since    1.0
     *  
     */                     
    $.fn.updateMetaboxLayout = function ( ) {
        var theme_content_width = parseInt( $('.gridster ul').data('content_width') );
        var metabox_width = parseInt( $('#gridster_workbench_metabox').width() );
        // width plus margin
        var gridster_content_blocks_width = 280 + 20; //parseInt( $('#gridster_content_blocks').width() );
        
        // workbench is smaller than themes $content_width
        if (
        (
            $('#post-body').hasClass('columns-1')
            &&
            ( ( theme_content_width + gridster_content_blocks_width ) < metabox_width )        
        )
        ||
        ( 
            $('#gridster_workbench_metabox').hasClass('two-columns')
            &&
            ( ( theme_content_width + gridster_content_blocks_width ) > metabox_width )
        )
        ) {
            // toggle CSS classes
            $('#gridster_workbench_metabox').removeClass('two-columns').addClass('one-column');
            // wrap widget blocks in two column-wraps to adjust the way our accordion works
            // get all widget-blocks
            var widgets = $('.gridster_widget-block');
            // get the half, to know where to slice the list
            var half = Math.floor( widgets.length/2 );
            // the wrap the first and the second half into divs
            widgets.filter(function(i){ return i <= half; }).wrapAll('<div class="accordion-wrap" />');
            widgets.filter(function(i){ return i > half; }).wrapAll('<div class="accordion-wrap" />');
            // now trigger each first widget-block to expand
            //$('.accordion-wrap .gridster_widget-block:first h3').trigger('click');
        
        // workbench is wider than themes $content_width        
        } else if (
        (
            $('#post-body').hasClass('columns-2')
            &&
            ( ( theme_content_width + gridster_content_blocks_width ) < metabox_width )        
        )
        ||
        ( 
            $('#gridster_workbench_metabox').hasClass('one-column')
            &&
            ( ( theme_content_width + gridster_content_blocks_width ) < metabox_width )
        )        
        ) {
            // toggle CSS classes
            $('#gridster_workbench_metabox').addClass('two-columns').removeClass('one-column');        
            // remove column wrapping from widget-blocks
            $('.accordion-wrap .gridster_widget-block').unwrap();
        } 
    }



    /**
     *  Get Posts by type to display lists inside wthe widegt-blocks
     *  
     *  @since    1.1          
     *  
     */ 
    $.fn.getPostsByType = function( post_type, paged,  search = null ) {

        // prepare options Array 
        var query_options = {
            
            // 
            post_type:  post_type,
            
            //
            paged: paged,
            
            //
            search: search,
        };
    
        // get HTML 
        $.ajax({
            type: 'GET',
            url: gridster_admin.ajaxUrl,
            dataType: 'html',
            data: ({ 
                // callback function, /plugins/cbach-wp-gridster/cbach-wp-gridster.php
                action: 'ajax_get_posts_by_type_widget_block',
                // security checking, Nonce
                nonce:    gridster_admin.ajaxNonce,
                // content options
                options: query_options,
                //
                post: $('#post_ID').val() 
            }),
            success: function( data ){
    
                // no data
                if ( data == '-1' || data == '' || data == '0' || data == 'undefined' ) {
                
                    var error_msg = $('<p />').text( gridster_admin.textAjaxNothingFound );
                    error_msg = $('<div />').addClass('error').append(error_msg);
                    $('#gridster_post_type-' + post_type + '-widget-block').find('.inside').html( error_msg );                    
                
                } else {
                   
                    $('#gridster_post_type-' + post_type + '-widget-block').find('.inside').html( data );
                    
                    
                    /**
                     *  Make <li>s inside the left column widget blocks draggable
                     *  and make them jump back to origin, when not dropped to gridster
                     *  
                     *  @since    1.0
                     *  
                     */                             
                    $( '.gridster_widget-block li' ).draggable({
                        revert: 'invalid',
                    });   
                }
                
                // hide spinner on success
                $('#gridster_post_type-' + post_type + '-widget-block').find('.spinner').hide();                
            }
        }); 
    };
    // load lists of all post_types on load
    $('.gridster_widget-block').each( function(  ) {
        var post_type = $(this).data('post_type');
        $.fn.getPostsByType( post_type, paged = 1 );
    });
    // load paged list of posts on paging-click
    $(document).on( 'click', '.widget-blocks-pagination', function(){
        $(this).parentsUntil('.gridster_widget-block').parent().find('.spinner').show();
        var post_type = $(this).parentsUntil('.gridster_widget-block').parent().data('post_type');
        var paged =  $(this).data('paged');
        var search = ( $(this).data('search') ) ? $(this).data('search') : null;  
        $.fn.getPostsByType( post_type, paged = paged, search );    
    });
    // load search-list of posts
    //setup before functions
    //timer identifier
    var typingTimer;
    //time in ms, 2 second for example                
    var doneTypingInterval = 2000;  
    
    //on keyup, start the countdown
    $(document).on( 'keyup', '.gridster_search-posts-by-type', function(){
        var input = $(this);    
        typingTimer = setTimeout( function() { $.fn.doneTyping( input ) }, doneTypingInterval);
    });
    
    //on keydown, clear the countdown 
    $(document).on( 'keydown', '.gridster_search-posts-by-type', function(){
        clearTimeout(typingTimer);
    });
    
    //user is "finished typing," get our SERP
    $.fn.doneTyping = function( input ) {
        input.parentsUntil('.gridster_widget-block').parent().find('.spinner').show();
        var post_type = input.parentsUntil('.gridster_widget-block').parent().data('post_type');
        var paged =  input.data('paged');
        var search = $.trim( input.val() );
        $.fn.getPostsByType( post_type, paged = paged, search );   
    }                
     
    
    
});  // end // jQuery(function($){  



jQuery(document).ready(function($) {

/*********************************************************************************************************************************************
 *  CPT Gridster post.php 
 ********************************************************************************************************************************************/

    /**
     *  Simple jQuery Accordion for widget-blocks
     *    
     *  @source   http://www.normansblog.de/simple-jquery-accordion/
     *  
     */              
    $.fn.WidgetBlockAccordion = function ( trig ) {
    		if ( trig.parent().hasClass('trigger_active') ) {
      			trig.siblings('.inside').slideToggle('fast');
      			trig.parent().removeClass('trigger_active');
      			trig.parent().siblings('.trigger_active').removeClass('trigger_active');            

    		} else {
      			trig.parent().siblings('.trigger_active').removeClass('trigger_active').find('.inside').slideToggle('fast');
      			trig.siblings('.inside').slideToggle('fast');
            trig.parent().addClass('trigger_active');
    		};
    		return false;    
    }
    // close all widget-blocks
    $('.gridster_widget-block h3, .gridster_widget-block .handlediv').not('.trigger_active').siblings('.inside').hide();
    // trigger accordion expander on click
    $('.gridster_widget-block h3, .gridster_widget-block .handlediv').click( function() {
        $.fn.WidgetBlockAccordion( $(this) );
    });
    // Show first widget-block
    $('.gridster_widget-block:first h3').trigger('click');               



    /**
     *  Show $content_width defined in current theme
     *  within workbench
     *  
     *  @since    1.0
     *  
     */
    var theme_content_width = $('.gridster ul').data('content_width');
    $('<div />')
        .addClass('content_width-border')
        .attr('title', gridster_admin.textMaximumContentWidth )
        .css( 'left', theme_content_width + 'px' )
        .appendTo( $('.gridster') );                         



    // initial load all widgets from DB     
    $.fn.LoadWidgetsOnStart();
    
    
    /**
     *  Test if workbench is wide enough to fit $content_width
     *  
     *  check this 
     *  - on load, 
     *  - on screen resize 
     *  - if menu is collapsed or opened
     *  - if column preferences are change within screen-options-tab      
     *  
     *  @since    1.0
     *  
     */
    // on load                                   
    $.fn.updateMetaboxLayout();    
    // on resize
    $(window).resize(function() {
        $.fn.updateMetaboxLayout();
    });
    // on menu collapse / open  
    $('#collapse-menu').on( 'click.collapse-menu', function(){
        // use timeout, to make sure all layout changes are applied
        setTimeout(function(){
                $.fn.updateMetaboxLayout();    
        },500);
    });
    // or if user has choosen between 1- and 2-columns layout within screen-options-tab 
    $('.columns-prefs input').on( 'change', function(){
        // use timeout, to make sure all layout changes are applied
        setTimeout(function(){
                $.fn.updateMetaboxLayout();    
        },500);
    });  



    // toggle Class on Jeditable elements when edited
    $('.gridster_edit, .gridster_edit-area').click( function() {
        if ( $(this).hasClass( 'isEdited' ) ) {
            $(this).removeClass( 'isEdited' );        
        } else {
            $(this).addClass( 'isEdited' );        
        }
    }); 
/*
    // toggle Class on Jeditable elements when edited
    $('.gridster_edit input, .gridster_edit-area input').click( function() {
        if ( $(this).parent().parent().hasClass( 'isEdited' ) ) {
            $(this).parent().parent().removeClass( 'isEdited' );        
        } 
    });
*/   


            
});