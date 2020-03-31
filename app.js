// BUDGET CONTROLLER

const budgetController = (function() {
	const Expense = function(id, description, category, value) {
		this.id = id;
		this.description = description;
		this.category = category;
		this.value = value;
		this.percentage = -1;
		this.expPerc = -1;
	};
	Expense.prototype.calcPercentage = function(totalIncome) {
		if (totalIncome > 0) {
			this.percentage = Math.round(this.value / totalIncome * 100);
		} else {
			this.percentage = -1;
		}
	};
	Expense.prototype.getPercentage = function() {
		return this.percentage;
	};
	Expense.prototype.expensePercentage = function(totalExpenses) {
		if (totalExpenses > 0) {
			this.expPerc = this.value / totalExpenses;
			this.expPerc = Math.round(this.value / totalExpenses * 100);
		} else {
			this.expPerc = -1;
		}
	};
	Expense.prototype.getExpPercent = function() {
		return this.expPerc;
	};
	const Income = function(id, description, category, value) {
		this.id = id;
		this.description = description;
		this.category = category;
		this.value = value;
	};
	let calculateTotal = function(type) {
		let sum = 0;
		data.allItems[type].forEach((curr) => {
			sum += curr.value;
		});
		data.totals[type] = sum;
	};
	/* let calculateTotalExpenses = function(type) {
		let sumE = 0;
		data.allItems[type].forEach((curr) => {
			sumE += curr.value;
		});
		data.totals[type] = sumE;
	}; */
	const data = {
		allItems   : {
			exp : [],
			inc : []
		},
		totals     : {
			exp : 0,
			inc : 0
		},
		budget     : 0,
		smPerc     : -1,
		percentage : -1
	};
	return {
		addItem               : function(type, des, cat, val) {
			// addItem              : function(type, des, cat, catP, val) {
			let newItem, ID;
			// Create new ID
			if (data.allItems[type].length > 0) {
				ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
			} else {
				ID = 0;
			}
			// Create new item based on 'income' or 'expense' type
			if (type === 'exp') {
				newItem = new Expense(ID, des, cat, val);
				// newItem = new Expense(ID, des, cat,catP, val);
			} else if (type === 'inc') {
				newItem = new Income(ID, des, cat, val);
			}
			// Push it into our data structure
			data.allItems[type].push(newItem);
			// Return the new element
			return newItem;
		},
		deleteItem            : function(type, id) {
			let ids, index;
			ids = data.allItems[type].map((current) => {
				return current.id;
			});
			index = ids.indexOf(id);
			if (index !== -1) {
				data.allItems[type].splice(index, 1);
			}
		},
		calculateBudget       : function() {
			// Caclulate total income and expenses
			calculateTotal('exp');
			calculateTotal('inc');
			// Calculate the Budget: income - expenses
			data.budget = data.totals.inc - data.totals.exp;
			// Calculate the Percentage of income that we spend
			if (data.totals.inc === 0) {
				data.percentage = -1;
			} else {
				data.percentage = Math.round(data.totals.exp / data.totals.inc * 100);
			}
		},
		/* calculateExpensePerc   : function() {
			// Caclulate total income and expenses
			calculateTotalExpenses('exp');
			// calculateTotal('inc');
			// Calculate the Expenses: income - expenses
			data.value = data.allItems.exp[this];
			// Calculate the Percentage of expenses that we spend
			if (data.totals.exp === 0) {
				data.smPerc = -1;
			} else {
				data.smPerc = Math.round(this.value / data.totals.exp * 100);
			}
		}, */
		calculatePercentages  : function() {
			data.allItems.exp.forEach((curr) => {
				curr.calcPercentage(data.totals.inc);
			});
		},
		calcExpPercentages    : function() {
			data.allItems.exp.forEach((curr) => {
				// console.log(data.totals.exp);
				curr.expensePercentage(data.totals.exp);
				// curr.expensePercentage(curr.percentage);
			});
		},
		getPercentages        : function() {
			let allPerc = data.allItems.exp.map((curr) => {
				return curr.getPercentage();
			});
			return allPerc;
		},
		getExpensePercentages : function() {
			let allExpPerc = data.allItems.exp.map((curr) => {
				return curr.getExpPercent();
			});
			return allExpPerc;
		},
		getBudget             : function() {
			return {
				budget     : data.budget,
				totalInc   : data.totals.inc,
				totalExp   : data.totals.exp,
				// smPerc     : data.smPerc.exp,
				percentage : data.percentage
			};
		},
		testing               : function() {
			console.log(data);
		}
	};
})();

// UI CONTROLLER
const UIController = (function() {
	const DOMstrings = {
		inputType         : '.add__type',
		inputDescription  : '.add__description',
		inputValue        : '.add__value',
		inputBtn          : '.add__btn',
		incomeContainer   : '.income__list',
		expensesContainer : '.expenses__list',
		budgetLabel       : '.budget__value',
		incomeLabel       : '.budget__income--value',
		expensesLabel     : '.budget__expenses--value',
		percentageLabel   : '.budget__expenses--percentage',
		container         : '.container',
		expensesPercLabel : '.item__percentage',
		dateLabel         : '.budget__title--month',
		topColor          : '.top',
		categoryMenu      : '.add__category',
		categoryMenu2     : '.add__category2',
		expPercent        : '.cat__percentage'

		// dropdownContent   : '.dropdown-content'
	};
	const formatNumber = function(num, type) {
		let numSplit, int, dec;
		// + or - before number, 2 decimal points, comma separating thousands
		num = Math.abs(num);
		num = num.toFixed(2);
		numSplit = num.split('.');
		int = numSplit[0];
		int = Number(int); // converts int into a number
		int = int.toLocaleString(); // Method that automatically add commas to the number, then returns a string, no need for an if/else statement anymore
		dec = numSplit[1];
		return `${type === 'inc' ? '+' : '-'} ${int}.${dec}`;
	};
	const nodeListForEach = function(list, callback) {
		for (let i = 0; i < list.length; i++) {
			callback(list[i], i);
		}
	};
	return {
		getinput           : function() {
			return {
				type        : document.querySelector(DOMstrings.inputType).value, // Will be either inc(income) or exp(expense)
				description : document.querySelector(DOMstrings.inputDescription).value,
				category    : document.querySelector(DOMstrings.categoryMenu).value,
				category2   : document.querySelector(DOMstrings.categoryMenu2).value,
				value       : parseFloat(document.querySelector(DOMstrings.inputValue).value)
			};
		},
		/* dropdownOptions    : function(type) {
			const menu = document.querySelector(DOMstrings.dropdown);
			if (type === 'inc') {
				menu.style.opacity = '100%';
			} else {
			}
		}, */
		addListItem        : function(obj, type) {
			let html, newHtml, element;
			// Create HTML string with placeholder text
			if (type === 'inc') {
				element = DOMstrings.incomeContainer;
				html =
					'<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="item__cat">%category%</div><div class="right__list clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			} else if (type === 'exp' || obj.category === DOMstrings.categoryMenu) {
				element = DOMstrings.expensesContainer;
				html =
					'<div class="item item__expenses clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="exp-container"><div class="cat__percentage">11%</div><div class="item__cat">%category%</div></div><div class="right__list-expenses clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			} else if (type === 'exp' || obj.category2 === DOMstrings.categoryMenu2) {
				element = DOMstrings.expensesContainer;
				html =
					'<div class="item item__expenses clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="exp-container"><div class="cat__percentage">11%</div><div class="item__cat">%category2%</div></div><div class="right__list-expenses clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			}
			if (obj.description[0] !== obj.description[0].toUpperCase()) {
				obj.description = obj.description[0].toUpperCase() + obj.description.substr(1);
			}
			// Replace the placeholder text with some actual data
			newHtml = html.replace('%id%', obj.id);
			newHtml = newHtml.replace('%description%', obj.description);
			newHtml = newHtml.replace('%category%', obj.category);
			newHtml = newHtml.replace('%category2%', obj.category2);
			newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
			// newHtml = newHtml.replace('%smPerc%', obj.smPerc);

			// Insert the HTML into the DOM
			document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
		},
		deleteListItem     : function(selectorID) {
			const el = document.getElementById(selectorID);
			el.parentNode.removeChild(el);
		},
		clearFields        : function() {
			let fields, fieldsArr;
			fields = document.querySelectorAll(`${DOMstrings.inputDescription}, ${DOMstrings.inputValue}`);

			fieldsArr = Array.prototype.slice.call(fields);

			fieldsArr.forEach((current) => {
				current.value = '';
			});
			// fieldsArr[0].focus();
			document.querySelector('.add__type').focus();
		},
		displayBudget      : function(obj) {
			let type;
			obj.budget > 0 ? (type = 'inc') : (type = 'exp');
			document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
			document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
			document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
			if (obj.budget < 0) {
				document.querySelector(DOMstrings.topColor).classList.add('top-red');
			} else if (obj.budget >= 0) {
				document.querySelector(DOMstrings.topColor).classList.remove('top-red');
			}
			if (obj.percentage > 0) {
				document.querySelector(DOMstrings.percentageLabel).textContent = `${obj.percentage}%`;
			} else {
				document.querySelector(DOMstrings.percentageLabel).textContent = '---';
			}
		},
		displayPercentages : function(percentages) {
			const fields = document.querySelectorAll(DOMstrings.expensesPercLabel); // returns Node List
			// console.log(fields);
			nodeListForEach(fields, function(current, index) {
				if (percentages[index] > 0) {
					current.textContent = percentages[index] + '%';
				} else {
					current.textContent = '---';
				}
			});
		},
		/* hideAndShowPercent : function(x) {
			if (x.matches) {
				document.querySelector(DOMstrings.expPercent).display = 'block';
				document.querySelectorAll(DOMstrings.categoryMenu2).display = 'none';
			}
		}, */
		displayExpPerc     : function(percentages) {
			const fields2 = document.querySelectorAll(DOMstrings.expPercent);
			nodeListForEach(fields2, function(current, index) {
				if (percentages[index] > 0) {
					current.textContent = percentages[index] + '%';
					// current.textContent = `${percentages[index]}%`;
				} else {
					current.textContent = '---';
				}
			});
		},
		displayMonth       : function() {
			let date = new Intl.DateTimeFormat('en', { year: 'numeric', month: 'long' }).format();
			document.querySelector(DOMstrings.dateLabel).textContent = date;
		},
		changedType        : function() {
			const fields = document.querySelectorAll(
				`${DOMstrings.inputType}, ${DOMstrings.inputDescription}, ${DOMstrings.inputValue}, ${DOMstrings.categoryMenu},${DOMstrings.categoryMenu2}`
			);
			nodeListForEach(fields, function(curr) {
				curr.classList.toggle('red-focus');
			});
			document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
		},

		getDOMstrings      : function() {
			return DOMstrings;
		}
	};
})();

// GLOBAL APP Control Module
const controller = (function(budgetCtrl, UICtrl) {
	/* const clickEvent = (function() {
		if ('ontouchstart' in document.documentElement === true) {
			return 'touchstart';
		} else {
			return 'click';
		}
	})(); */
	/* const setupEventListeners = function(evt) {
		const DOM = UICtrl.getDOMstrings();
		document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
		if (document.querySelector(DOM.categoryMenu)) {
			document.querySelector(DOM.categoryMenu).addEventListener('keypress', function(event) {
				if (event.key === 'Enter' || event.which === 13) {
					evt.preventDefault();
					ctrlAddItem();
				}
			});
		} else if (document.querySelector(DOM.categoryMenu2)) {
			document.querySelector(DOM.categoryMenu2).addEventListener('keypress', function(event) {
				if (event.key === 'Enter' || event.which === 13) {
					evt.preventDefault();
					ctrlAddItem();
				}
			});
		}
		document.querySelector(DOM.inputBtn).addEventListener('touchstart', ctrlAddItem);
		if (document.querySelector(DOM.categoryMenu)) {
			document.querySelector(DOM.categoryMenu).addEventListener(
				'keypress',
				function(event) {
					if (event.touch) {
						evt.preventDefault();
						ctrlAddItem();
					}
				},
				true
			);
		} else if (document.querySelector(DOM.categoryMenu2)) {
			document.querySelector(DOM.categoryMenu2).addEventListener(
				'keypress',
				function(event) {
					if (event.touch) {
						evt.preventDefault();
						ctrlAddItem();
					}
				},
				true
			);
		} */
	const setupEventListeners = function(evt) {
		const DOM = UICtrl.getDOMstrings();
		document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
		if (document.querySelector(DOM.categoryMenu)) {
			document.querySelector(DOM.categoryMenu).addEventListener('keypress', function(event) {
				if (event.key === 'Enter' || event.which === 13) {
					ctrlAddItem();
				}
			});
		} else if (document.querySelector(DOM.categoryMenu2)) {
			document.querySelector(DOM.categoryMenu2).addEventListener('keypress', function(event) {
				if (event.key === 'Enter' || event.which === 13) {
					ctrlAddItem();
				}
			});
		}
		document.getElementById('touchable').addEventListener('touch', function(evt) {
			if (evt.touches.item(0) == evt.targetTouches.item(0)) {
				if (document.querySelector('.add__btn')) {
					document.querySelector('.add__btn').addEventListener(
						'touchend',
						function(event) {
							if (event.touch) {
								evt.preventDefault();
								ctrlAddItem();
							}
						},
						false
					);
				} else if (document.querySelector('.add__btn')) {
					document.querySelector('.add__btn').addEventListener(
						'touchend',
						function(event) {
							if (event.touch) {
								evt.preventDefault();
								ctrlAddItem();
							}
						},
						false
					);
				}
			}
		});

		document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
		document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
	};
	const updateBudget = function() {
		// 1. Calculate the Budget
		budgetCtrl.calculateBudget();
		// 2. Method to return the Budget
		let budget = budgetCtrl.getBudget();
		// 3. Display the Budget on the UI
		UICtrl.displayBudget(budget);
	};
	const updatePercentages = function() {
		// 1. Calculate percentages
		budgetCtrl.calculatePercentages();
		// 2. Read percentages from Budget controller
		const percentages = budgetCtrl.getPercentages();
		// 3. Update the UI with the new percentages
		UICtrl.displayPercentages(percentages);
	};
	const updateExpPercentages = function() {
		budgetCtrl.calcExpPercentages();
		// budgetCtrl.calcSmPercentages();
		const percentages2 = budgetCtrl.getExpensePercentages();
		console.log(percentages2);
		UICtrl.displayExpPerc(percentages2);
	};
	/* const hideAndShow = function() {
		document.querySelector('.add__category2').addEventListener('click', budgetCtrl.hideAndShowPercent);
		// budgetCtrl.hideAndShowPercent();
	}; */
	const ctrlAddItem = function() {
		let input, newItem;
		// 1. Get the field input data
		input = UICtrl.getinput();
		console.log(input);

		if (input.description !== '' && !isNaN(input.value) && input.value > 0 && input.category !== 'Category') {
			// 2. Add the item to the Budget Controller
			newItem = budgetCtrl.addItem(input.type, input.description, input.category, input.value);
			UICtrl.addListItem(newItem, input.type);
			UICtrl.clearFields();
			updateBudget();
			updatePercentages();
			updateExpPercentages();
		} else if (
			input.description !== '' &&
			!isNaN(input.value) &&
			input.value > 0 &&
			input.category2 !== 'Category'
		) {
			newItem = budgetCtrl.addItem(input.type, input.description, input.category2, input.value);
			UICtrl.addListItem(newItem, input.type);
			UICtrl.clearFields();
			updateBudget();
			updatePercentages();
			updateExpPercentages();
		}
	};
	const ctrlDeleteItem = function(event) {
		let itemID, splitID, type, ID;
		itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
		if (itemID) {
			// inc-1
			splitID = itemID.split('-');
			type = splitID[0];
			ID = parseInt(splitID[1]);

			// 1. Delete item from Data Structure
			budgetCtrl.deleteItem(type, ID);
			// 2. Delete item from UI
			UICtrl.deleteListItem(itemID);
			// 3. Update and show the new Budget
			updateBudget();
			// 4. Calculate and update Percentages
			updatePercentages();
		}
	};
	return {
		init : function() {
			UICtrl.displayMonth();
			UICtrl.displayBudget({
				budget     : 0,
				totalInc   : 0,
				totalExp   : 0,
				percentage : -1
			});
			setupEventListeners();
		}
	};
})(budgetController, UIController);

controller.init();
