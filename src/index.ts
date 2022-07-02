import epub, { Location, Rendition } from "epubjs"
import Book from "./Book"
import defaultTheme from "./defaultTheme"
import hash from "./hash"

const book = epub()
let rendition: Rendition
let currentBook: Book
let renderedOnce = false

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

	book.opened.then(async () => {
		currentBook = {
			title: book.packaging.metadata.title,
		}
		document.title = currentBook.title
		renderedOnce = false
	})

	rendition.themes.default(defaultTheme)
	// The type declaration seems to be missing this, but the build passes
	// alright.
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

	rendition.on("rendered", async () => {
		if (!renderedOnce) {
			console.debug("First render, attempting to restore position.")
			const titleHash = await hash(currentBook.title)
			const previousLoc = localStorage.getItem(titleHash)
			if (previousLoc) {
				console.debug("Found previous loc: ", previousLoc)
				const loc = JSON.parse(previousLoc) as Location
				rendition.display(loc.start.href)
				console.debug("Moved to previous loc")
			}
			console.debug(
				"Done restoring position, flagging that first render is done.",
			)
			renderedOnce = true
		}
	})

	rendition.on("keyup", keyListener)
	rendition.on("relocated", async (location: Location) => {
		if (renderedOnce) {
			const titleHash = await hash(currentBook.title)
			localStorage.setItem(titleHash, JSON.stringify(location))
			console.debug("Store location in local storage: ", location)
		} else {
			console.debug("Skipping write of loc as first render.")
		}
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
