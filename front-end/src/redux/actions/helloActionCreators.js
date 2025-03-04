import * as actions from './helloActionTypes';

export function toggleName() {
	return {
		type: actions.TOGGLE_NAME,
	}
}
