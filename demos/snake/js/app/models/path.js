(function(snake) {

	'use strict';

	var Path = function(grid, dispatcher, time) {

		this.grid = grid;
		this.values = [];
		this.currentLength = 1;
		this.direction = 'right';
		this.keys = [];
		this.dispatcher = dispatcher;

		this.reset();

		dispatcher.addEventListener('keydown', function(event) {
			this.keys.push(event.params);
			if (this.keys.length > 2) {
				this.keys.length = 2;
			}
		}.bind(this));

		dispatcher.addEventListener('eating', this.addCell.bind(this));

		time.addSpeedHandler(function() {
			var nextDirection = this.keys.length > 0 ? this.keys[0] : this.direction;
			var nextPosition = this.getNextPosition(nextDirection);
			if (nextPosition) {
				this.direction = nextDirection;
				this.add(nextPosition.col, nextPosition.row);
			}
			this.keys.shift();
		}.bind(this));
	};

	Path.prototype.reset = function() {
		this.values = [];
		this.keys = [];
		this.direction = 'right';
		this.add(1, 1);
		this.currentLength = 1;
	};

	Path.prototype.get = function() {
		return this.values;
	};

	Path.prototype.getLeader = function() {
		if (this.values.length === 0) {
			return null;
		}
		return this.values[0];
	};

	Path.prototype.addCell = function() {
		this.currentLength++;
	};

	Path.prototype.getNextPosition = function(direction) {

		var nextCol,
			nextRow,
			leader = this.getLeader();

		switch(direction) {
		case 'left':
			nextCol = leader.col - 1;
			nextRow = leader.row;
			break;
		case 'right':
			nextCol = leader.col + 1;
			nextRow = leader.row;
			break;
		case 'up':
			nextCol = leader.col;
			nextRow = leader.row - 1;
			break;
		case 'down':
			nextCol = leader.col;
			nextRow = leader.row + 1;
			break;
		}

		if (this.isCellBusy(nextCol, nextRow)) {
			if (!this.isOppositeDirection(direction)) {
				this.dispatcher.dispatch('end', 'eating-tail');
			}
			return null;
		}
		if (!this.grid.isInBoundaries(nextCol, nextRow)) {
			this.dispatcher.dispatch('end', 'reached-boundaries');
			return null;
		}

		return {
			col: nextCol,
			row: nextRow
		};

	};

	Path.prototype.isOppositeDirection = function(direction) {
		switch(direction) {
			case 'left':
				return this.direction === 'right';
			case 'right':
				return this.direction === 'left';
			case 'up':
				return this.direction === 'down';
			case 'down':
				return this.direction === 'up';
		}
		return false;
	};

	Path.prototype.isCellBusy = function(col, row) {
		return this.values.filter(function(element) {
			return col === element.col && row === element.row;
		}).length > 0;
	};

	Path.prototype.add = function(col, row) {
		var coords = this.grid.getCoordsFromPosition(col, row);
		var pos = this.grid.getPositionFromCoords(coords.x, coords.y);
		var cell = new snake.Cell();
		cell.x = coords.x;
		cell.y = coords.y;
		cell.index = this.grid.getIndexFromPosition(col, row);
		cell.col = pos.col;
		cell.row = pos.row;
		cell.direction = this.direction;
		this.values.unshift(cell);
		this.normalize();
		return cell;
	};

	Path.prototype.normalize = function() {
		if (this.values.length > this.currentLength) {
			this.values.length = this.currentLength;
		}
	};

	// exports
	snake.Path = Path;

})(window.snake = window.snake || {});