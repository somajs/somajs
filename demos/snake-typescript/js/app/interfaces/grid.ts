module snake {
	export interface IGrid {

		width: number;
		height: number;
		cellWidth: number;
		cellHeight: number;
		numCols: number;
		numRows: number;
		numIndex: number;

		isInBoundaries(col:number, row:number): bool;
		getIndexFromCoords(x:number, y:number): number;
		getIndexFromPosition(col:number, row:number): number;
		getPositionFromCoords(x:number, y:number): any;
		getPositionFromIndex(index:number): any;
		getCoordsFromPosition(col:number, row:number): any;
		getCoordsFromIndex(index:number): any;
	}
}
