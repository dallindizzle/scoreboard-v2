import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import _ from "lodash";
import styled from "styled-components";

import { PLACEMENTS, ROUND_WIN_DEDUCTION } from "../constants";

const StyledScoreField = styled.input`
  font-size: 25px;
  text-align: center;

  width: 90%;
  height: 90%;

  border: none;

  background-color: transparent;

  color: ${({ value }) => (value === "W" ? "#3cb371" : "black")};

  &:focus {
    outline: none;
  }
`;

const TotalScoreCell = styled.td`
  font-weight: 600;
`;

const StyledRow = styled.tr`
  transition: background 500ms ease;

  background-color: ${({ $placement }) =>
    $placement === PLACEMENTS.FIRST
      ? "gold"
      : $placement === PLACEMENTS.SECOND
      ? "#dcdcdc"
      : $placement === PLACEMENTS.THIRD
      ? "#f4a460"
      : "white"};
`;

const NameCell = styled.td`
  cursor: pointer;

  &:hover {
    background-color: #eeaeae;
  }
`;

const noAutoComplete = (event) => {
  event.target.setAttribute("autocomplete", "off");
};

const PlayerRow = (props) => {
  const {
    name,
    numOfRounds,
    setPlayerTotals,
    placement,
    removePlayer,
    focusNextScore,
  } = props;

  const [scores, setScores] = useState(() => Array(numOfRounds).fill(""));
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (scores.every(score => score === "")) return;

    const totalScore = scores.reduce((acc, s) => {
      const score = s === "W" ? ROUND_WIN_DEDUCTION : Number(s) || 0;
      return acc + score;
    }, 0);

    setTotal(totalScore);

    setPlayerTotals((oldTotals) => ({
      ...oldTotals,
      [name]: totalScore,
    }));
  }, [name, scores, setPlayerTotals]);

  const onChange = useCallback((e) => {
    const [, round] = e.target.id.split(":");
    const input = e.target.value;
    let newScore = null;

    if (input === "w" || input === "W") {
      newScore = "W";
    } else if (input === "") {
      newScore = "";
    } else if (!isNaN(input)) {
      newScore = Number(input);
    } else {
      return;
    }

    setScores((prevScores) => {
      const newScores = [...prevScores];
      newScores[round] = newScore;
      return newScores;
    });
  }, []);

  const onScoreEnter = useCallback(
    (e) => {
      if (e.key === "Enter") {
        const [player, round] = e.target.id.split(":");
        focusNextScore(player, Number(round));
      }
    },
    [focusNextScore]
  );

  const roundFields = useMemo(
    () =>
      _.times(numOfRounds, (i) => (
        <td key={`${name}:${i}`}>
          <StyledScoreField
            id={`${name}:${i}`}
            onKeyDown={onScoreEnter}
            onChange={onChange}
            value={scores[i]}
            onFocus={noAutoComplete}
            key={`${name}:${i}`}
          />
        </td>
      )),
    [name, numOfRounds, onChange, onScoreEnter, scores]
  );

  const askRemovePlayer = (name) => {
    if (window.confirm(`Are you sure you want to remove ${name}?`)) {
      removePlayer(name);
    }
  };

  return (
    <StyledRow $placement={placement}>
      <NameCell onClick={() => askRemovePlayer(name)}>{name}</NameCell>
      {roundFields}
      <TotalScoreCell>{total}</TotalScoreCell>
    </StyledRow>
  );
};

export default PlayerRow;
