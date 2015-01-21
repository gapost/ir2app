exec("./fileutil.js")


exec("./deltaControl.js")
exec("./irradControl.js")
exec("./TempControl.js")
exec("./rates.js")


function startRecording()
{
	with(data.buff)
	{
		clear()
		setSourceBuffer(jobs.buff)
	}
}
function stopRecording()
{
	data.buff.setSourceBuffer()
}

function save(comment)
{
	h5write("data/"+fileAutoNumber()+".h5",comment)
}
