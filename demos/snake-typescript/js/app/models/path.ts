///<reference path='../vo/cell.ts'/>

module snake {
	export class Path {

		private currentLength:number = 0;
		private direction:string = null;
		private keys:any[] = null;
		private values:any[] = null;
		private dispatcher:any = null;
		private grid:any = null;
		private time:any = null;

		constructor(grid, dispatcher, time) {
			this.grid = grid;
			this.dispatcher = dispatcher;
			this.time = time;
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

		}

		public reset() {
			this.values = [];
			this.keys = [];
			this.currentLength = 1;
			this.direction = 'right';
			this.add(1, 1);
		}

		public get() {
			return this.values;
		}

		public getLeader() {
			if (this.values.length === 0) {
				return null;
			}
			return this.values[0];
		}

		public addCell() {
			this.currentLength++;
		}

		public getNextPosition(direction) {

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
		}

		public isOppositeDirection(direction) {
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
		}

		public isCellBusy(col, row) {
			return this.values.filter(function(element) {
				return col === element.col && row === element.row;
			}).length > 0;
		}

		public add(col:number, row:number) {
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
		}

		public normalize() {
			if (this.values.length > this.currentLength) {
				this.values.length = this.currentLength;
			}
		}

	}
}