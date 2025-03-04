import { Map} from 'immutable'
import * as actions from '../actions/helloActionTypes';
const initialState = Map({
	name: 'world'
})


export default function helloReducer(state = initialState, action = {}) {
	switch (action.type) {
		case actions.TOGGLE_NAME: {
			const currentName = state.get('name');
			return currentName === 'world'? state.set('name', 'Loay') : state.set('name', 'world');
		}
		default: {
			return state;
		}
	}
}
