function fileAutoNumber()
{
	var i = textLoad("data/_autonumber");
	i++;
	textSave(i.toString(),"data/_autonumber");
	if (i<1000) return "0"+i.toString();
	else return i.toString();
}

function save(comment)
{
	var fname = "data/"+fileAutoNumber()+".h5";
	//print("Preparing to save " + fname);
	h5write(fname,comment)
	print("Saved data on file " + fname);
}

