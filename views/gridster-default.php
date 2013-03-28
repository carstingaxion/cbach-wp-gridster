<a href="<?php the_permalink(); ?>" title="<?php the_title_attribute(); ?>">
    <?php if ( has_post_thumbnail() ) : ?>
        <div class="gridster-image-wrap">
        <?php the_post_thumbnail( ); ?>
        </div>
    <?php endif; ?>
    <h1 class="gridster_edit entry-title"><?php the_title(); ?></h1>
    <p class="gridster_edit_area entry-summary">
        <?php echo get_the_excerpt( ); ?>
    </p> 
    <?php 
        echo wp_trim_words( get_the_content(), 5, '' ); 
        echo get_the_content();    
    ?>       
</a>