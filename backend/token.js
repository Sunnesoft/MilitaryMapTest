var role = null;
var tokstr = null;
var accessOp = {};

exports.getRole = function(){ return role; }
exports.getString = function(){ return tokstr; }

/*
 *Token
 * X - Number 0-9
 * User - "JXUXXXX2XXXX4X8"
 * Admin - "KXAXXXX6XXXX2X8"
 * Unresolved - all other
 */

exports.parse = function(str)
{
	tokstr = str;

	//For Admin
	if(str.length == 15 && str[0] == 'K' && 
		str[2] == 'A' && str[7] == '6' && 
		str[12] == '2' && str[14] == '8')
	{  
		role = 'admin';
		return;
	}

	//For User
	if(str.length == 15 && str[0] == 'J' && 
		str[2] == 'U' && str[7] == '2' && 
		str[12] == '4' && str[14] == '8')
	{
		role = 'user';
		return;
	}

	role = 'unresolved';
}

exports.registerOp = function(op)
{
	if(this.isOpRegistered(op))
	{
		return false;
	}	
	
	accessOp[op] = true;	
	return true;
}

exports.isOpRegistered = function(op)
{
	return accessOp.hasOwnProperty(op);
}


exports.hasAccess = function(op)
{
	return this.isOpRegistered(op);
}
