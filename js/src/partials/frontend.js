import {getParametersNumber, getParametersKits, getAverage} from "./generate";
import {getGradeNumbers} from "./grade";
import {grathDraw} from "./grathic";
import {setNullResaultError} from "./errno";

let resultTable,
	resultGradeExist,
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

function addTableItem(parametersRow, itemValue, rowSettings = {}) {
	const parametersItem = document.createElement("td");
	parametersItem.innerHTML = itemValue;
	if (rowSettings.colspan)
		parametersItem.setAttribute("colspan", rowSettings.colspan);
	if (rowSettings.rowspan)
		parametersItem.setAttribute("rowspan", rowSettings.rowspan);
	if (rowSettings.style)
		parametersItem.setAttribute("style", rowSettings.style);
	
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
	resultTableDraw(resultGradeExist);
}

function resultTableDraw(gradeExist) {
	const parametersKitsArray = getParametersKitsOnThisPage();
	if (parametersKitsArray.length > 0) {
		const table = document.createElement("table");
		resultTable.append(table);

		// Создание шапки таблицы
		const tableHeader = document.createElement("thead");
		let headerRow = document.createElement("tr");

		addTableItem(headerRow, `№`, { rowspan : 2});
		let gradeNumbers = getGradeNumbers();
		let parametersNumber = parametersKitsArray[0].length - gradeNumbers;
		const borderStyle = "1px solid #000";

		addTableItem(headerRow, `Значения рандомизированных весовых коэффициентов`, {
			colspan : parametersNumber,
		});
		if (gradeExist) {
			addTableItem(headerRow, `Рейтинг объекта`, {
				colspan : gradeNumbers,
				style: `border-left: ${borderStyle};`,
			});
			headerRow.setAttribute("style", `border-top: ${borderStyle};`);
		}
		tableHeader.append(headerRow);
		headerRow = document.createElement("tr");

		for (let i = 1; i <= parametersNumber; i++) {
			addTableItem(headerRow, `p<sub>${i}</sub>`);
		}
		if (gradeExist) {
			for (let i = 1; i <= gradeNumbers; i++) {
				let parameters = i == 1 ? {style: `border-left: ${borderStyle};`} :  {};
				addTableItem(headerRow, `O<sub>${i}</sub>`, parameters);
			}
		}
		tableHeader.append(headerRow);
		table.append(tableHeader);

		// Наполнение таблицы
		const tableBody = document.createElement("tbody");
		const itemNumberShift = itemNumberOnPage * (resultTableOpenPage - 1) + 1;
		parametersKitsArray.forEach((kit, num) => {
			const parametersRow = document.createElement("tr");
			addTableItem(parametersRow, itemNumberShift + num);
			kit.forEach((item, i) => {
				let parameters = i == parametersNumber ? {style: `border-left: ${borderStyle};`} :  {};
				addTableItem(parametersRow, item, parameters);
			});
	
			tableBody.append(parametersRow);
		});

		// Добавление средних значений в конец таблицы:
		if (resultTableOpenPage == resultTablePageNumber) {
			const averageRow = document.createElement("tr");
			averageRow.classList.add('parameters-table__row');
			addTableItem(averageRow, "Среднее<br>значение");
	
			const average = getAverage();
			average.forEach((item, i) => {
				let parameters = i == parametersNumber ? {style: `border-left: ${borderStyle};`} :  {};
				addTableItem(averageRow, item, parameters);
			});
	
			tableBody.append(averageRow);
		}
	
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

function addGradePDraw() {
	let numGrade = getGradeNumbers(),
	parametersKits = getParametersKits(),
	shift = getParametersNumber(),
	arrLength = parametersKits.length;

	if (numGrade > 1) {
		// Создание матрицы из количества элементов
		let resultMatrix = Array.from({ length: numGrade }, (_, i) =>
			Array.from({ length: numGrade }, (_, j) => {
				if (i == j) return 0;
				if (i < j) return Math.round((1 - (parametersKits.filter((value, index) => value[shift+j] > parametersKits[index][shift+i]).length/arrLength)) * 100) / 100;
				return  Math.round((parametersKits.filter((value, index) => value[shift+i] > parametersKits[index][shift+j]).length/arrLength) * 100) / 100;
			})
		);

		// Выводим результат в таблице
		const table = document.createElement("table");
		const tableBlock = document.querySelector('.js_result-grade-p-table');
		tableBlock.innerHTML = "";
		tableBlock.append(`
		Таблица стахастического доминирования оценок —
		Вероятность, что оценка набора строки больше оценки набора столбца`);
		tableBlock.append(table);
		document.querySelector('[data-menu-name="grade-p"]').classList.remove('hide');
	
		// Создание шапки таблицы
		const tableHeader = document.createElement("thead");
		const headerRow = document.createElement("tr");
	
		addTableItem(headerRow, `№`);
		for (let i = 1; i <= resultMatrix.length; i++) {
			addTableItem(headerRow, `O<sub>${i}</sub>`);
		}
		tableHeader.append(headerRow);
		table.append(tableHeader);
	
		// Наполнение таблицы
		const tableBody = document.createElement("tbody");
		resultMatrix.forEach((kit, num) => {
			const row = document.createElement("tr");
			addTableItem(row, `O<sub>${num+1}</sub>`);
			kit.forEach((item, i) => {
				addTableItem(row, item);
			});
		
			tableBody.append(row);
		});
		table.append(tableBody);
	} else {
		document.querySelector('[data-menu-name="grade-p"]').classList.add('hide');
	}
};

function setResultNumber() {
	const numberKits = getParametersKits().length;
	document.querySelectorAll('.js_parametrs-kits-end-number').forEach((element) => {
		element.innerHTML = numberKits ? numberKits : '-';
	});
}

function resultAdd(gradeExist) {
	if (getParametersKits().length) {
		// Вывод таблицы
		setResultTablePageNumber(getParametersKits());
		resultTableOpenPage = 1;
		resultTableDraw(resultGradeExist = gradeExist);
		document.querySelector('.js_result-block').classList.add('active');

		// Таблица вероятности оценок
		addGradePDraw()

		//Вывод графиков
		grathDraw();

		// Подготовка фала на скачивание
		downloadButtonPrepare();
	} else {
		setNullResaultError();
	}
	setResultNumber();
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

	const oldTable = document.querySelector(".js_parametrs-grade-input .js-parameters-grade-table-block table tbody");
	let oldTableRowsNumber = oldTable ? oldTable.querySelectorAll("tr:last-child td").length : 2;

	addGradeTableHeaderItem(headerRow, `№`);
	for (let i = 1; i < oldTableRowsNumber; i++) {
		addGradeTableHeaderItem(headerRow, `O<sub>${i}</sub>`);
	}
	tableHeader.append(headerRow);
	table.append(tableHeader);

	// Наполнение таблицы
	const tableBody = document.createElement("tbody");
	for (let n = 1; n <= parametersNumber; n++) {
		const parametersRow = document.createElement("tr");
		parametersRow.classList.add('parameters-grade-table__row');
		parametersRow.classList.add('js_parameters-grade-table-row');

		addGradeTableItem(parametersRow, `X<sub>${n}</sub>`);
		for(let i=1; i < oldTableRowsNumber; i++) {
			addGradeTableItem(parametersRow);
		}

		tableBody.append(parametersRow);
	}

	table.append(tableBody);

	return table
}

function parametrsGradeInputRemoveKit(element) {
	const gradeTable = element.closest(".js_parametrs-grade-input").querySelector(".js-parameters-grade-table-block");
	const tableLastRows = gradeTable.querySelectorAll("tr td:last-child");
	if (tableLastRows.length > 1) {
		tableLastRows.forEach(element => element.parentNode.removeChild(element));
	}
}

function parametrsGradeInputAddKit(element, parametersNumber) {
	const gradeTable = element.closest(".js_parametrs-grade-input").querySelector(".js-parameters-grade-table-block");
	const tableHead = gradeTable.querySelector("thead");
	tableHead.querySelectorAll("tr").forEach((tableRow)=> {
		addGradeTableHeaderItem(tableRow, `O<sub>${tableRow.querySelectorAll("td").length}</sub>`);
	});
	const tableBody = gradeTable.querySelector("tbody");
	tableBody.querySelectorAll("tr").forEach((tableRow)=> {
		addGradeTableItem(tableRow);
	});
}

function downloadButtonPrepare() {
	const anchor = document.querySelector('.js_result-download');

	// Download json | No need
	// let data = JSON.stringify(getParametersKits(), null, '\t');

	// anchor.href = `data:text/json;charset=utf-8,${encodeURIComponent(data)}`;
	// anchor.download = 'data.json';

	// Dounload csv | Need
	let data = [...getParametersKits()];
	let dataHeader = new Array(data[0].length).fill().map(function(item, i) {
        if (i < getParametersNumber()) {
			return `p${i + 1}`;
		}
		if (i < getParametersNumber() + getGradeNumbers()) {
			return `O${i + 1 - getParametersNumber()}`;
		}
		return `undefined`;
    });
	data.unshift(dataHeader);
	data = data.map(e => e.join(";")).join("\n").replaceAll('.', ',');
	
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