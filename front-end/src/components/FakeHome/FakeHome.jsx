import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import { toggleName } from '../../redux/actions/helloActionCreators';


export default function FakeHome() {
	const name = useSelector((state) => state.hello.get('name'));
	const dispatch = useDispatch();
	return (
		<>
          <p>Hello: {name}</p>
          <button type="button" onClick={() => dispatch(toggleName())}>
            Toggle name
          </button>
		</>
	)
}
