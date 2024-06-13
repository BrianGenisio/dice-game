import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Dice from './Dice';

describe('Dice Component', () => {
  test('renders the correct number of dots for a given value', () => {
    const { rerender } = render(<Dice value={1} rolling={false} selected={false} onClick={() => {}} />);
    expect(screen.getByTestId('dot-center')).toBeInTheDocument();

    rerender(<Dice value={2} rolling={false} selected={false} onClick={() => {}} />);
    expect(screen.getByTestId('dot-top-left')).toBeInTheDocument();
    expect(screen.getByTestId('dot-bottom-right')).toBeInTheDocument();

    rerender(<Dice value={3} rolling={false} selected={false} onClick={() => {}} />);
    expect(screen.getByTestId('dot-center')).toBeInTheDocument();
    expect(screen.getByTestId('dot-top-left')).toBeInTheDocument();
    expect(screen.getByTestId('dot-bottom-right')).toBeInTheDocument();

    rerender(<Dice value={4} rolling={false} selected={false} onClick={() => {}} />);
    expect(screen.getByTestId('dot-top-left')).toBeInTheDocument();
    expect(screen.getByTestId('dot-top-right')).toBeInTheDocument();
    expect(screen.getByTestId('dot-bottom-left')).toBeInTheDocument();
    expect(screen.getByTestId('dot-bottom-right')).toBeInTheDocument();

    rerender(<Dice value={5} rolling={false} selected={false} onClick={() => {}} />);
    expect(screen.getByTestId('dot-center')).toBeInTheDocument();
    expect(screen.getByTestId('dot-top-left')).toBeInTheDocument();
    expect(screen.getByTestId('dot-top-right')).toBeInTheDocument();
    expect(screen.getByTestId('dot-bottom-left')).toBeInTheDocument();
    expect(screen.getByTestId('dot-bottom-right')).toBeInTheDocument();

    rerender(<Dice value={6} rolling={false} selected={false} onClick={() => {}} />);
    expect(screen.getByTestId('dot-middle-left')).toBeInTheDocument();
    expect(screen.getByTestId('dot-middle-right')).toBeInTheDocument();
    expect(screen.getByTestId('dot-top-left')).toBeInTheDocument();
    expect(screen.getByTestId('dot-top-right')).toBeInTheDocument();
    expect(screen.getByTestId('dot-bottom-left')).toBeInTheDocument();
    expect(screen.getByTestId('dot-bottom-right')).toBeInTheDocument();
  });

  test('displays rolling class when rolling is true', () => {
    const { rerender } = render(<Dice value={1} rolling={true} selected={false} onClick={() => {}} />);
    expect(screen.getByTestId('dice')).toHaveClass('rolling');
    rerender(<Dice value={1} rolling={false} selected={false} onClick={() => {}} />);
    expect(screen.getByTestId('dice')).not.toHaveClass('rolling');
  });

  test('updates display value when rolling', () => {
    jest.useFakeTimers();
    const { rerender } = render(<Dice value={1} rolling={true} selected={false} onClick={() => {}} />);

    jest.advanceTimersByTime(100);
    rerender(<Dice value={1} rolling={true} selected={false} onClick={() => {}} />);
    expect(screen.getByTestId('dot-top-left')).toBeInTheDocument();
    expect(screen.getByTestId('dot-bottom-right')).toBeInTheDocument();

    jest.useRealTimers();
  });

  test('applies selected class when selected is true', () => {
    const { rerender } = render(<Dice value={1} rolling={false} selected={true} onClick={() => {}} />);
    expect(screen.getByTestId('dice')).toHaveClass('selected');
    rerender(<Dice value={1} rolling={false} selected={false} onClick={() => {}} />);
    expect(screen.getByTestId('dice')).not.toHaveClass('selected');
  });

  test('calls onClick when dice is clicked', () => {
    const handleClick = jest.fn();
    render(<Dice value={1} rolling={false} selected={false} onClick={handleClick} />);
    fireEvent.click(screen.getByTestId('dice'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
