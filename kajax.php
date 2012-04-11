<?php


/*------------UTILITIES--------------*/

/*creates a jquery element selector*/
function jelem($target)
{
	return "$('" . $target . "')";
}

/*creates a jquery method call*/
function jmethod($target,$func_name,$paramstr)
{
	return jelem($target).".".$func_name."(".$paramstr.");";
}

/*creates a javascritp string*/
function jstr($str)
{
	$str = str_replace( "\n", '', $str );
	return "'".$str."'";
}

/*---------------KAJAX----------------*/
class Kajax
{
	protected $buffer		= '';

	public function __construct()
	{
	}

	/** manually adds script */
	public function rawscript( $js )
	{
		$this->buffer .= $js;
	}


	/*logs an object to the console*/
	public function olog( $obj )
	{
		$this->buffer .=  $this->log( json_encode($obj) );
	}

	/*logs a string to the console*/
	public function log( $text )
	{
		$this->buffer .=  sprintf('console.log("%s");', $text);
	}

	public function html($target, $content)
	{
		$this->buffer .= jmethod($target,'html',jstr($content));
	}

	public function append($target, $content)
	{
		$this->buffer .= jmethod($target,'append',jstr($content));
	}

	public function prepend($target, $content)
	{
		$this->buffer .= jmethod($target,'prepend',jstr($content));
	}

	public function remove($target)
	{
		$this->buffer .= jmethod($target,'remove','');
	}

	public function empty_elem($target)
	{
		$this->buffer .= jmethod($target,'empty','');
	}

	public function toggle($target)
	{
		$this->buffer .= jmethod($target,'toggle','');
	}

	public function attr($target, $attr, $value)
	{
		$this->buffer .= jmethod($target,'attr', jstr($attr).','.jstr($value) );
	}

	public function css($target, $prop, $value)
	{
		$this->buffer .= jmethod($target,'css', jstr($prop).','.jstr($value) );
	}

	public function addClass($target, $class)
	{
		$this->buffer .= jmethod($target,'addClass', jstr($class));
	}

	public function removeClass($target, $class)
	{
		$this->buffer .= jmethod($target,'removeClass', jstr($class));
	}

	public function toggleClass($target, $class)
	{
		$this->buffer .= jmethod($target,'toggleClass', jstr($class));
	}

	public function redirect($url)
	{
	   $this->buffer .= 'window.location = "'.$url.'"';
	}

	public function render()
	{
		return $this->buffer;
	}
}


