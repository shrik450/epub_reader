import epub, { Location, Rendition } from "epubjs"

const book = epub()
let rendition: Rendition

const inputElement = document.getElementById("input")!

inputElement.addEventListener("change", (e: any) => {
	const file = e!.target!.files[0]
	if (window.FileReader) {
		const reader = new FileReader()
		reader.onload = openBook
		reader.readAsArrayBuffer(file)
	}
})

const openBook = (e: ProgressEvent<FileReader>) => {
	const bookData = e.target!.result as ArrayBuffer
	const next = document.getElementById("next")!
	const prev = document.getElementById("prev")!

	book.open(bookData, "binary")

	rendition = book.renderTo("viewer", {
		flow: "scrolled-doc",
		width: "100%",
		height: "90%",
	})

	rendition.themes.default({
		body: {
			background: "#303134 !important",
			color: "#e8eaed !important",
		},
		p: {
			direction: "ltr",
			"font-family": "'M PLUS Rounded 1c', sans-serif;",
		},
	})

	//@ts-ignore
	rendition.themes.fontFamily = "'M PLUS Rounded 1c', sans-serif;"
	rendition.display()

	let keyListener = (e: KeyboardEvent) => {
		// Left Key
		if (e.code === "ArrowLeft") {
			rendition.prev()
		}

		// Right Key
		if (e.code === "ArrowRight") {
			rendition.next()
		}
	}

	rendition.on("keyup", keyListener)
	rendition.on("relocated", (location: Location) => {
		console.log(location)
	})

	next.addEventListener(
		"click",
		function (e) {
			rendition.next()
			e.preventDefault()
		},
		false,
	)

	prev.addEventListener(
		"click",
		function (e) {
			rendition.prev()
			e.preventDefault()
		},
		false,
	)

	document.addEventListener("keyup", keyListener, false)
}
