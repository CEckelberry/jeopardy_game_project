const api_url = 'https://jservice.io/api/';
const NUM_CATEGORIES = 6;

// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]

let categories = [];

/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */

async function getCategoryIds() {
	let response = await axios.get(`${api_url}categories?count=100`);
	//from lodash library, helps get random samples without duplicates from each batch of 100 we get back in the result
	let categories = _.sampleSize(response.data, NUM_CATEGORIES);
	let catIDs = categories.map((result) => {
		let id = result.id;
		return id;
	});
	//console.log(catIDs);
	return catIDs;
}

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */

async function getCategory(catId) {
	let response = await axios.get(`${api_url}category?id=${catId}`);
	cat = response.data;
	//console.log(cat);
	let title = cat.title;
	let clues = cat.clues.map((result) => {
		let clueQuestion = result.question;
		let clueAnswer = result.answer;
		//console.log(`clueQuestion: ${clueQuestion} clueAnswer: ${clueAnswer}`);

		//using map we will return an array of the question, answer, and showing set to null by default.
		return {
			question: clueQuestion,
			answer: clueAnswer,
			showing: null
		};
	});
	//returnt the category (from catId) and the clues array
	return {
		title: title,
		clues: clues
	};
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

async function fillTable() {
	let categoryIDs = await getCategoryIds();
	for (let id of categoryIDs) {
		categories.push(await getCategory(id));
	}
	//console.log(categories);
	const $col = $('#tableLocation');
	$col.empty();
	let $table = $(`<table class="table table-bordered mt-2 bg-primary" id="tableID">
                        <thead>
                        <tr class="text-uppercase font-weight-bold text-light">
                            <th scope="col">${categories[0].title}</th>
                            <th scope="col">${categories[1].title}</th>
                            <th scope="col">${categories[2].title}</th>
                            <th scope="col">${categories[3].title}</th>
                            <th scope="col">${categories[4].title}</th>
                            <th scope="col">${categories[5].title}</th>
                        </tr>
                        </thead>
                        <tbody class="text-warning font-weight-bold tableBody">
                        <tr>
                            <td>?</td>
                            <td>?</td>
                            <td>?</td>
                            <td>?</td>
                            <td>?</td>
                            <td>?</td>
                        </tr>
                        <tr>
                            <td>?</td>
                            <td>?</td>
                            <td>?</td>
                            <td>?</td>
                            <td>?</td>
                            <td>?</td>
                        </tr>
                        <tr>
                            <td>?</td>
                            <td>?</td>
                            <td>?</td>
                            <td>?</td>
                            <td>?</td>
                            <td>?</td>
                        </tr>
                        <tr>
                            <td>?</td>
                            <td>?</td>
                            <td>?</td>
                            <td>?</td>
                            <td>?</td>
                            <td>?</td>
                        </tr>
                        <tr>
                            <td>?</td>
                            <td>?</td>
                            <td>?</td>
                            <td>?</td>
                            <td>?</td>
                            <td>?</td>
                        </tr>
                        </tbody>
                        </table>`);

	let $button = $(`<button class="btn btn-dark btn-lg btn-block" id="resetBtn">Reset Game</button>`);
	$col.append($table);
	$col.append($button);
}

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

function handleClick(evt) {
	//innerHTML or innerText
	//current cell, current column, current row, then match these up to the array of clues\categories
	let currentCell = evt.target;
	let currRow = currentCell.parentElement.rowIndex - 1;
	let curCol = currentCell.cellIndex;
	let curQuest = categories[curCol].clues[currRow].question;
	let curAnsw = categories[curCol].clues[currRow].answer;
	let curShowing = categories[curCol].clues[currRow].showing;

	// console.log(curCol);
	// console.log(currRow);
	// console.log(currentCell);
	// console.log(curQuest);
	// console.log(curAnsw);
	// console.log(curShowing);

	if (curShowing === null) {
		currentCell.innerHTML = curQuest;
		categories[curCol].clues[currRow].showing = 1;
	}
	else if (curShowing === 1) {
		currentCell.innerHTML = curAnsw;
		categories[curCol].clues[currRow].showing = 2;
	}
	else {
		console.log('Already Revealed!');
	}
}

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

function showLoadingView() {
	const $col = $('#tableLocation');
	$col.empty();
	//selecting progress bar div I created
	let $progressDiv = $('#progress');
	let $progressBar = $(
		`<div class="container progress-bar progress-bar-striped bg-success progress-bar-animated" id="myProgress">LOADING!<div id="myBar"></div></div>`
	);
	//appending progress bar to the progress div
	$progressDiv.append($progressBar);
	setTimeout(hideLoadingView, 1000);
	categories = [];
}

/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView() {
	//selecting progress bar and emptying it out before calling fill table\reset
	let $progressDiv = $('#progress');
	$progressDiv.empty();
	fillTable();
}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {
	$(document).ready(fillTable());
}

/** On click of start / restart button, set up game. */
// TODO
$('#tableLocation').on('click', '#resetBtn', function() {
	showLoadingView();
});

/** On page load, add event handler for clicking clues */

// TODO

$('#tableLocation').on('click', 'td', function(evt) {
	//console.log('you clicked on a td!');
	handleClick(evt);
});

setupAndStart();
