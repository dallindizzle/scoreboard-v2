"use client";

import React, { useCallback, useMemo, useState } from "react";
import _ from "lodash";
import styled from "styled-components";

import PlayerRow from "./PlayerRow";
import AddPlayerRow from "./AddPlayerRow";
import { DEFAULT_NAMES, PLACEMENTS } from "../constants";

const StyledTable = styled.table`
  margin: 50px auto 50px auto;

  border-collapse: collapse;

  text-align: center;

  font-size: 25px;
  font-family: Arial, serif;

  td,
  tr,
  th {
    width: 100px;
    height: 75px;

    padding: 8px;

    border: 2px solid black;
  }

  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`;

const TableHeaderCell = styled.th`
  font-weight: 600;
`;

const Scoreboard = () => {
  const [names, setNames] = useState([...DEFAULT_NAMES]);
  const [playerTotals, setPlayerTotals] = useState({});

  const focusNextScore = useCallback(
    (player, round) => {
      const indexOfNextPlayer = names.indexOf(player) + 1;
      if (indexOfNextPlayer < names.length) {
        const nextPlayer = names[indexOfNextPlayer];
        document.getElementById(`${nextPlayer}:${round}`).focus();
      } else if (round < names.length - 1) {
        const nextPlayer = names[0];
        document.getElementById(`${nextPlayer}:${round + 1}`).focus();
      } else {
        document.getElementById(`${player}:${round}`).blur();
      }
    },
    [names]
  );

  const playerPlacements = useMemo(() => {
    if (Object.keys(playerTotals).length > 0) {
      const placements = {};

      const topThreeScores = [...new Set(Object.values(playerTotals))]
        .sort((a, b) => a - b)
        .splice(0, 3);
      const playersWithScores = Object.keys(playerTotals);

      playersWithScores.forEach((name) => {
        const score = playerTotals[name];
        if (score === topThreeScores[0]) {
          placements[name] = PLACEMENTS.FIRST;
        } else if (score === topThreeScores[1]) {
          placements[name] = PLACEMENTS.SECOND;
        } else if (score === topThreeScores[2]) {
          placements[name] = PLACEMENTS.THIRD;
        } else {
          placements[name] = "loser";
        }
      });

      // just in case
      window.localStorage.setItem("scores", JSON.stringify(playerTotals));

      return placements;
    }
    return [];
  }, [playerTotals]);

  const roundHeaders = useMemo(
    () =>
      _.times(names.length, (i) => (
        <TableHeaderCell key={i}>{i + 1}</TableHeaderCell>
      )),
    [names.length]
  );

  const removePlayer = useCallback((name) => {
    setNames((prevNames) => prevNames.filter((player) => player !== name));
    setPlayerTotals((prevTotals) => {
      const newTotals = { ...prevTotals };
      delete newTotals[name];
      return newTotals;
    });
  }, []);

  const addPlayer = useCallback((name) => {
    name && setNames((prevNames) => [...new Set([...prevNames, name])]);
  }, []);

  const playerRows = useMemo(
    () =>
      names.map((name) => (
        <PlayerRow
          name={name}
          numOfRounds={names.length}
          setPlayerTotals={setPlayerTotals}
          placement={playerPlacements[name]}
          key={name}
          removePlayer={removePlayer}
          focusNextScore={focusNextScore}
        />
      )),
    [focusNextScore, names, playerPlacements, removePlayer]
  );

  return (
    <StyledTable>
      <tbody>
        <tr>
          <TableHeaderCell>Name</TableHeaderCell>
          {roundHeaders}
          <TableHeaderCell>Total</TableHeaderCell>
        </tr>
        {playerRows}
        <AddPlayerRow addPlayer={addPlayer} />
      </tbody>
    </StyledTable>
  );
};

export default Scoreboard;
