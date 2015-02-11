exec("./ir2app/fileutil.js")


exec("./ir2app/deltaControl.js")
exec("./ir2app/irradControl.js")
exec("./ir2app/TempControl.js")
exec("./ir2app/rates.js")
exec("./ir2app/auxControl.js")


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
