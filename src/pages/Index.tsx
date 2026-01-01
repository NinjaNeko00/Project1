import { KonigsbergGame } from '@/components/game/KonigsbergGame';
import { Helmet } from 'react-helmet-async';

const Index = () => {
  return (
    <>
      <Helmet>
        <title>The Königsberg Challenge - Eulerian Path Puzzle Game</title>
        <meta 
          name="description" 
          content="Solve the famous Königsberg Bridge problem! Cross every bridge exactly once in this interactive graph theory puzzle game featuring AI solver and multiple difficulty levels."
        />
        <meta name="keywords" content="Königsberg, Eulerian path, graph theory, puzzle game, Euler, bridges, math game" />
      </Helmet>
      <KonigsbergGame />
    </>
  );
};

export default Index;
