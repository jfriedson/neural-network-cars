export enum CollisionGroup {
    none = 0,
    
	isCar = 0b0001 << 16,
	isWall = 0b0010 << 16,
	isCheckpoint = 0b0100 << 16,

	withCar = 0b0001,
	withWall = 0b0010,
	withCheckpoint = 0b0100,
}
