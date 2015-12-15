<?
function XMLReader( array $t_args, array $output ) {
    $my_output = [];
    
    foreach( $output as $key => $out ) {
        $name = $key;
        $my_output[$name] = $out;
    }

    $xpath_row = $t_args['paths']['row'];
    $xpath_columns = $t_args['paths']['columns'];

    $className = generate_name( 'XMLReader' );
?>

class <?=$className?> {
    std::istream& my_stream;
    pugi::xml_document doc;
    const char* xpath_row;
    std::vector<const char*> xpath_columns;
    pugi::xpath_node_set rows;
    pugi::xpath_node_set::const_iterator start;
    pugi::xpath_node_set::const_iterator end;

    <?  \grokit\declareDictionaries($my_output); ?>

public:
    <?=$className?> ( GIStreamProxy& _stream ) :
        my_stream(_stream.get_stream( ))
    {
        doc.load( my_stream );

        xpath_row = "<?=$xpath_row?>";

        rows = doc.select_nodes(xpath_row);

        <?  
            $push = 'xpath_columns.push_back("';
            $close_brace = '");';
            foreach ($xpath_columns as $col) {?>
                <?=$push?><?=$col?><?=$close_brace?>
        <?  }
        ?>

        // Capture the first and last row
        start =  rows.begin();
        end = rows.end();
    }

    bool ProduceTuple( <?=typed_ref_args($my_output)?> ) 
    {

        if( start == end ) {
            return false;
        }
        else
        {   
            pugi::xml_node xmlnode = start->node();

            std::vector<const char*>::const_iterator it = xpath_columns.begin();

            <?  
                $col_num = 0;
                $node_type = 'auto ';
                $select_single_node = ' = xmlnode.select_single_node(';
                $close = ');';
                $iterator_increment = '++it;';
                foreach( $my_output as $name => $type ) {?>
                    <?=$node_type?><?=' col_'?><?=$col_num?><?=$select_single_node?>*it<?=$close?>

                    <?=\grokit\fromStringDict($name, $type, 'col_'.$col_num.'.node().child_value()')?>;

                    <? $col_num = $col_num +1;?>
                    <?=$iterator_increment?>
            <?
                }
            ?>

            ++start;

            return true;
        }
    }
};

<?
    $sys_headers = [ 'vector', 'string', 'iostream', 'fstream' ];

    return [
        'name' => $className,
        'kind' => 'GI',
        'output' => $my_output,
        'system_headers' => $sys_headers,
        'lib_headers' => [
            'pugixml.hpp'
        ]
    ];
}
?>
