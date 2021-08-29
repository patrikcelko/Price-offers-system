import React from 'react';
import NumberFormat from 'react-number-format';
import { INumberFormatCustomProps } from '../models/interfaces';

const NumberFormatCustom = (props: INumberFormatCustomProps) => {
  const { inputRef, onChange, ...other } = props;

  return (
    <NumberFormat
      {...other}
      getInputRef={inputRef}
      onValueChange={(values: { value: any; }) => {
        onChange({
          target: {
            name: props.name,
            value: values.value,
          },
        });
      }}
      thousandSeparator
      isNumericString
      prefix="€ "
    />
  );
};

export default NumberFormatCustom;
