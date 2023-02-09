import {getParametersNumber, getParametersKits} from "./generate";
import {getGradeNumbers} from "./grade";
import {grathDraw} from "./grathic";
import {setNullResaultError} from "./errno";

let resultTable,
	errnoField;

let resultTablePageNumber,
	itemNumberOnPage = 100,
	resultTableOpenPage = 1;

function setResultTable(parametersTable) {
	resultTable = parametersTable;
}

function setErrorField(errorField) {
	errnoField = errorField;
}

function clear(errnoField, parametersTable) {
	parametersTable.innerHTML = '';
	errnoField.innerHTML = '';
}

function addTableHeaderItem(headerRow, itemName) {
	const headerItem = document.createElement("td");
	headerItem.classList.add('parameters-table__header-item');
	headerItem.classList.add('parameters-table__item');
	headerItem.innerHTML = itemName;
	headerRow.append(headerItem);
}

function addTableItem(parametersRow, itemValue) {
	const parametersItem = document.createElement("td");
	parametersItem.classList.add('parameters-table__item');
	parametersItem.innerHTML = itemValue;
	
	parametersRow.append(parametersItem);
}

function setResultTablePageNumber(parametersKitsArray) {
	resultTablePageNumber = Math.ceil(parametersKitsArray.length / itemNumberOnPage);
}

function getParametersKitsOnThisPage() {
	const pageShiftParameter = itemNumberOnPage * (resultTableOpenPage - 1);
	return getParametersKits().slice(0 + pageShiftParameter, itemNumberOnPage + pageShiftParameter);
}

function paginationItemEventListenerOnClick(event) {
	const paginationItem = this;
	const paginationBlock = paginationItem.parentNode;
	paginationBlock.querySelectorAll('.open').forEach(function(element){
		element.classList.remove('open');
	})
	paginationItem.classList.add('open');
	resultTableOpenPage = paginationItem.value;

	clear(errnoField, resultTable);
	resultTableDraw();
}

function resultTableDraw(gradeExist) {
	const parametersKitsArray = getParametersKitsOnThisPage();
	if (parametersKitsArray.length > 0) {
		const table = document.createElement("table");
		table.classList.add('parameters-table__table');
		resultTable.append(table);

		// Создание шапки таблицы
		const tableHeader = document.createElement("thead");
		const headerRow = document.createElement("tr");
		headerRow.classList.add('parameters-table__header-row');

		addTableHeaderItem(headerRow, `№`);
		let gradeNumbers = getGradeNumbers();
		let parametersNumber = parametersKitsArray[0].length - gradeNumbers;
		parametersNumber = gradeExist ? parametersNumber : parametersNumber + 1;
		for (let i = 1; i < parametersNumber; i++) {
			addTableHeaderItem(headerRow, `p${i}`);
		}
		if (gradeExist) {
			for (let i = 1; i <= gradeNumbers; i++) {
				addTableHeaderItem(headerRow, `q${i}`)
			}
			addTableHeaderItem(headerRow, `Q`)
		}
		tableHeader.append(headerRow);
		table.append(tableHeader);

		// Наполнение таблицы
		const tableBody = document.createElement("tbody");
		const itemNumberShift = itemNumberOnPage * (resultTableOpenPage - 1) + 1;
		parametersKitsArray.forEach((kit, num) => {
			const parametersRow = document.createElement("tr");
			parametersRow.classList.add('parameters-table__row');
			addTableItem(parametersRow, itemNumberShift + num);
			kit.forEach((item, i) => {
				addTableItem(parametersRow, item);
			});
	
			tableBody.append(parametersRow);
		});
		table.append(tableBody);

		// Добавление пагинации
		const resultTableBlock = resultTable.parentNode;
		const paginationBlock = resultTableBlock.querySelector('.js_result-table-pagination');
		const paginationInfo = resultTableBlock.querySelector('.js_this-page-info');
		paginationBlock.innerHTML = '';
		paginationInfo.innerHTML = ``;
		if (resultTablePageNumber > 1) {
			for (let i = 0; i < resultTablePageNumber; i++) {
				const paginationItem = document.createElement('button');
				paginationItem.classList.add('result-table__pagination-item');
				paginationItem.value = i + 1;
				paginationItem.innerHTML = paginationItem.value;
				paginationBlock.append(paginationItem);
	
				paginationItem.addEventListener('click', paginationItemEventListenerOnClick);
			}
			paginationInfo.innerHTML = `Текущая страница ${resultTableOpenPage} из ${resultTablePageNumber}`;
		}
	}
}

function resultAdd(gradeExist) {
	if (getParametersKits().length) {
		// Вывод таблицы
		setResultTablePageNumber(getParametersKits());
		resultTableOpenPage = 1;
		resultTableDraw(gradeExist);
		document.querySelector('.js_result-block').classList.add('active');

		//Вывод графиков
		grathDraw();

		// Подготовка фала на скачивание
		downloadButtonPrepare();
	} else {
		setNullResaultError();
	}
}

function generateBegin() {
	document.body.classList.add('calculate');
	document.querySelector('.js_result-block').classList.remove('active');
}

function generateEnd() {
	document.body.classList.remove('calculate');
}

function addGradeTableHeaderItem(headerRow, itemName) {
	const headerItem = document.createElement("td");
	headerItem.classList.add('parameters-grade-table__header-item');
	headerItem.classList.add('parameters-grade-table__item');
	headerItem.innerHTML = itemName;
	headerRow.append(headerItem);
}

function addGradeTableItem(parametersRow, text = 0) {
	const parametersItem = document.createElement("td");
	parametersItem.classList.add('parameters-grade-table__item');
	let parametersItemInput;

	if (text) {
		parametersItemInput = document.createElement("div");
		parametersItemInput.classList.add('parameters-grade-table__input');
		parametersItemInput.classList.add('parameters-grade-table__input--text');
		parametersItemInput.innerHTML = text;
	} else {
		parametersItemInput = document.createElement("input");
		//parametersItemInput.setAttribute('type', 'number');
		parametersItemInput.classList.add('parameters-grade-table__input');
		parametersItemInput.classList.add('js_parameters-grade-table-item-input');
	}
	
	parametersItem.append(parametersItemInput);
	
	parametersRow.append(parametersItem);
}

function createGradeInputTable(parametersNumber) {
	const table = document.createElement("table");
	table.classList.add('parameters-grade-table');

	// Создание шапки таблицы
	const tableHeader = document.createElement("thead");
	const headerRow = document.createElement("tr");
	headerRow.classList.add('parameters-grade-table__header-row');

	addGradeTableHeaderItem(headerRow, `№`);
	for (let i = 0; i < parametersNumber; i++) {
		addGradeTableHeaderItem(headerRow, `q${i}`);
	}
	tableHeader.append(headerRow);
	table.append(tableHeader);

	// Наполнение таблицы
	const oldTable = document.querySelector(".js_parametrs-grade-input .js-parameters-grade-table-block table tbody");
	let oldTableRowsNumber = oldTable ? oldTable.querySelectorAll("tr").length : 1;
	const tableBody = document.createElement("tbody");
	oldTableRowsNumber++;
	for (let n = 1; n < oldTableRowsNumber; n++) {
		const parametersRow = document.createElement("tr");
		parametersRow.classList.add('parameters-grade-table__row');
		parametersRow.classList.add('js_parameters-grade-table-row');

		addGradeTableItem(parametersRow, n);
		for(let i=0; i < parametersNumber; i++) {
			addGradeTableItem(parametersRow);
		}

		tableBody.append(parametersRow);
	}

	table.append(tableBody);

	return table
}

function parametrsGradeInputRemoveKit(element) {
	const gradeTable = element.closest(".js_parametrs-grade-input").querySelector(".js-parameters-grade-table-block");
	const tableBody = gradeTable.querySelector("tbody");
	const tableLastRows = tableBody.querySelectorAll("tr");
	if (tableLastRows.length > 1) {
		tableBody.removeChild(tableLastRows[tableLastRows.length - 1]);
	}
}

function parametrsGradeInputAddKit(element, parametersNumber) {
	const gradeTable = element.closest(".js_parametrs-grade-input").querySelector(".js-parameters-grade-table-block");
	const tableBody = gradeTable.querySelector("tbody");
	const parametersRow = document.createElement("tr");
	parametersRow.classList.add('parameters-grade-table__row');
	parametersRow.classList.add('js_parameters-grade-table-row');
	addGradeTableItem(parametersRow, tableBody.querySelectorAll("tr").length + 1);
	for(let i=0; i < parametersNumber; i++) {
		addGradeTableItem(parametersRow);
	}
	tableBody.append(parametersRow);
}

function downloadButtonPrepare() {
	const anchor = document.querySelector('.js_result-download');

	// Download json | No need
	// let data = JSON.stringify(getParametersKits(), null, '\t');

	// anchor.href = `data:text/json;charset=utf-8,${encodeURIComponent(data)}`;
	// anchor.download = 'data.json';

	// Dounload csv | Need
	let data = getParametersKits();
	let dataHeader = new Array(data[0].length).fill().map(function(item, i) {
        if (i < getParametersNumber()) {
			return `p${i + 1}`
		}
		if (i < getParametersNumber() + getGradeNumbers()) {
			return `q${i + 1 - getParametersNumber()}`
		}
		return `Q`
    });
	data.unshift(dataHeader);
	data = data.map(e => e.join(";")).join("\n");
	
	anchor.href = `data:text/csv;charset=utf-8,${encodeURIComponent(data)}`;
	anchor.download = 'data.csv';
}

export {
	clear,
	resultAdd,
	generateBegin,
	generateEnd,
	setResultTable,
	setErrorField,
	createGradeInputTable,
	parametrsGradeInputRemoveKit,
	parametrsGradeInputAddKit,
};