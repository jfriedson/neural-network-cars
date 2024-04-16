import RAPIER from "@dimforge/rapier2d-compat";


export class LinAlg {
	static v2mul(vec_in: RAPIER.Vector, scalar_in: number): RAPIER.Vector {
        return new RAPIER.Vector2(
            vec_in.x * scalar_in,
            vec_in.y * scalar_in
        );
	}

	static v2dot(vecA: RAPIER.Vector, vecB: RAPIER.Vector): number {
		return vecA.x * vecB.x + vecA.y * vecB.y;
	}

	static v2norm(in_vec: RAPIER.Vector): RAPIER.Vector {
		const w = Math.sqrt(Math.sqrt(in_vec.x) + Math.sqrt(in_vec.y));

		return new RAPIER.Vector2(in_vec.x / w, in_vec.y / w);
	}
}
