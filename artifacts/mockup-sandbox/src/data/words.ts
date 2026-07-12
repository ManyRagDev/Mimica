export type Difficulty = 'easy' | 'medium' | 'hard';
export type CategoryKey = 'acoes' | 'cultura-pop' | 'lugares' | 'objetos' | 'abstratos';

export interface Word {
  id: string;
  term: string;
  category: CategoryKey;
  difficulty: Difficulty;
}

export interface Modifier {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export const CATEGORIES: Record<CategoryKey, { label: string; color: string; icon: string }> = {
  acoes: { label: 'Ações', color: '#3B82F6', icon: 'Zap' },
  'cultura-pop': { label: 'Cultura Pop', color: '#EC4899', icon: 'Film' },
  lugares: { label: 'Lugares', color: '#10B981', icon: 'MapPin' },
  objetos: { label: 'Objetos', color: '#F59E0B', icon: 'Box' },
  abstratos: { label: 'Abstrato', color: '#8B5CF6', icon: 'Sparkles' },
};

export const DIFFICULTY_POINTS: Record<Difficulty, number> = {
  easy: 1,
  medium: 2,
  hard: 3,
};

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'Fácil',
  medium: 'Médio',
  hard: 'Difícil',
};

export const MODIFIERS: Modifier[] = [
  {
    id: 'm1',
    name: 'Mímica Dupla',
    description: 'Dois jogadores do time fazem a mímica juntos, sem combinar nada antes!',
    icon: 'Users',
  },
  {
    id: 'm2',
    name: 'Modo Estátua',
    description: 'Apenas 3 movimentos! Depois congele e o time adivinha com você parado.',
    icon: 'User',
  },
  {
    id: 'm3',
    name: 'Mímica Livre',
    description: 'Sem categoria! A palavra aparece sem dica nenhuma. Se vira!',
    icon: 'Shuffle',
  },
  {
    id: 'm4',
    name: 'Turbo',
    description: 'Tempo reduzido pela metade! Corra que está acabando!',
    icon: 'Timer',
  },
  {
    id: 'm5',
    name: 'Silêncio Total',
    description: 'Zero sons! Nenhum barulho. Só gestos e expressões.',
    icon: 'VolumeX',
  },
];

export const WORDS: Word[] = [
  // AÇÕES — Fácil
  { id: 'a01', term: 'Nadar', category: 'acoes', difficulty: 'easy' },
  { id: 'a02', term: 'Correr', category: 'acoes', difficulty: 'easy' },
  { id: 'a03', term: 'Dormir', category: 'acoes', difficulty: 'easy' },
  { id: 'a04', term: 'Comer', category: 'acoes', difficulty: 'easy' },
  { id: 'a05', term: 'Chorar', category: 'acoes', difficulty: 'easy' },
  { id: 'a06', term: 'Dançar', category: 'acoes', difficulty: 'easy' },
  { id: 'a07', term: 'Voar', category: 'acoes', difficulty: 'easy' },
  { id: 'a08', term: 'Escalar', category: 'acoes', difficulty: 'easy' },
  { id: 'a09', term: 'Abraçar', category: 'acoes', difficulty: 'easy' },
  { id: 'a10', term: 'Pular', category: 'acoes', difficulty: 'easy' },
  { id: 'a11', term: 'Rir', category: 'acoes', difficulty: 'easy' },
  { id: 'a12', term: 'Escovar os dentes', category: 'acoes', difficulty: 'easy' },
  { id: 'a13', term: 'Tirar foto', category: 'acoes', difficulty: 'easy' },
  { id: 'a14', term: 'Dirigir', category: 'acoes', difficulty: 'easy' },
  { id: 'a15', term: 'Cozinhar', category: 'acoes', difficulty: 'easy' },
  { id: 'a16', term: 'Varrer', category: 'acoes', difficulty: 'easy' },
  { id: 'a17', term: 'Pintar', category: 'acoes', difficulty: 'easy' },
  { id: 'a18', term: 'Lavar a louça', category: 'acoes', difficulty: 'easy' },
  // AÇÕES — Médio
  { id: 'a19', term: 'Meditar', category: 'acoes', difficulty: 'medium' },
  { id: 'a20', term: 'Pescar', category: 'acoes', difficulty: 'medium' },
  { id: 'a21', term: 'Andar de bicicleta', category: 'acoes', difficulty: 'medium' },
  { id: 'a22', term: 'Fazer ioga', category: 'acoes', difficulty: 'medium' },
  { id: 'a23', term: 'Patinar', category: 'acoes', difficulty: 'medium' },
  { id: 'a24', term: 'Surfar', category: 'acoes', difficulty: 'medium' },
  { id: 'a25', term: 'Montar a cavalo', category: 'acoes', difficulty: 'medium' },
  { id: 'a26', term: 'Fazer compras', category: 'acoes', difficulty: 'medium' },
  { id: 'a27', term: 'Carregar mala pesada', category: 'acoes', difficulty: 'medium' },
  { id: 'a28', term: 'Plantar uma árvore', category: 'acoes', difficulty: 'medium' },
  { id: 'a29', term: 'Fazer pão', category: 'acoes', difficulty: 'medium' },
  { id: 'a30', term: 'Escalar montanha', category: 'acoes', difficulty: 'medium' },
  // AÇÕES — Difícil
  { id: 'a31', term: 'Fazer malabarismo', category: 'acoes', difficulty: 'hard' },
  { id: 'a32', term: 'Hipnotizar alguém', category: 'acoes', difficulty: 'hard' },
  { id: 'a33', term: 'Levitar', category: 'acoes', difficulty: 'hard' },
  { id: 'a34', term: 'Tocar harpa', category: 'acoes', difficulty: 'hard' },
  { id: 'a35', term: 'Mergulhar no fundo do mar', category: 'acoes', difficulty: 'hard' },
  { id: 'a36', term: 'Decolar de foguete', category: 'acoes', difficulty: 'hard' },

  // CULTURA POP — Fácil
  { id: 'c01', term: 'Simba', category: 'cultura-pop', difficulty: 'easy' },
  { id: 'c02', term: 'Spider-Man', category: 'cultura-pop', difficulty: 'easy' },
  { id: 'c03', term: 'Mario', category: 'cultura-pop', difficulty: 'easy' },
  { id: 'c04', term: 'Pikachu', category: 'cultura-pop', difficulty: 'easy' },
  { id: 'c05', term: 'Shrek', category: 'cultura-pop', difficulty: 'easy' },
  { id: 'c06', term: 'Batman', category: 'cultura-pop', difficulty: 'easy' },
  { id: 'c07', term: 'Cinderela', category: 'cultura-pop', difficulty: 'easy' },
  { id: 'c08', term: 'Homem de Ferro', category: 'cultura-pop', difficulty: 'easy' },
  { id: 'c09', term: 'Jack Sparrow', category: 'cultura-pop', difficulty: 'easy' },
  { id: 'c10', term: 'Darth Vader', category: 'cultura-pop', difficulty: 'easy' },
  { id: 'c11', term: 'Superman', category: 'cultura-pop', difficulty: 'easy' },
  { id: 'c12', term: 'Frozen', category: 'cultura-pop', difficulty: 'easy' },
  // CULTURA POP — Médio
  { id: 'c13', term: 'Harry Potter', category: 'cultura-pop', difficulty: 'medium' },
  { id: 'c14', term: 'Forrest Gump', category: 'cultura-pop', difficulty: 'medium' },
  { id: 'c15', term: 'Indiana Jones', category: 'cultura-pop', difficulty: 'medium' },
  { id: 'c16', term: 'Naruto', category: 'cultura-pop', difficulty: 'medium' },
  { id: 'c17', term: 'Breaking Bad', category: 'cultura-pop', difficulty: 'medium' },
  { id: 'c18', term: 'Vingadores', category: 'cultura-pop', difficulty: 'medium' },
  { id: 'c19', term: 'Titanic', category: 'cultura-pop', difficulty: 'medium' },
  { id: 'c20', term: 'Stranger Things', category: 'cultura-pop', difficulty: 'medium' },
  { id: 'c21', term: 'Game of Thrones', category: 'cultura-pop', difficulty: 'medium' },
  { id: 'c22', term: 'Matrix', category: 'cultura-pop', difficulty: 'medium' },
  { id: 'c23', term: 'O Rei Leão', category: 'cultura-pop', difficulty: 'medium' },
  { id: 'c24', term: 'Jurassic Park', category: 'cultura-pop', difficulty: 'medium' },
  // CULTURA POP — Difícil
  { id: 'c25', term: 'Thanos', category: 'cultura-pop', difficulty: 'hard' },
  { id: 'c26', term: 'Gandalf', category: 'cultura-pop', difficulty: 'hard' },
  { id: 'c27', term: 'Walter White', category: 'cultura-pop', difficulty: 'hard' },
  { id: 'c28', term: 'Daenerys Targaryen', category: 'cultura-pop', difficulty: 'hard' },
  { id: 'c29', term: 'Hannibal Lecter', category: 'cultura-pop', difficulty: 'hard' },
  { id: 'c30', term: 'Tony Montana', category: 'cultura-pop', difficulty: 'hard' },

  // LUGARES — Fácil
  { id: 'l01', term: 'Praia', category: 'lugares', difficulty: 'easy' },
  { id: 'l02', term: 'Montanha', category: 'lugares', difficulty: 'easy' },
  { id: 'l03', term: 'Floresta', category: 'lugares', difficulty: 'easy' },
  { id: 'l04', term: 'Aeroporto', category: 'lugares', difficulty: 'easy' },
  { id: 'l05', term: 'Hospital', category: 'lugares', difficulty: 'easy' },
  { id: 'l06', term: 'Escola', category: 'lugares', difficulty: 'easy' },
  { id: 'l07', term: 'Igreja', category: 'lugares', difficulty: 'easy' },
  { id: 'l08', term: 'Supermercado', category: 'lugares', difficulty: 'easy' },
  { id: 'l09', term: 'Estádio', category: 'lugares', difficulty: 'easy' },
  { id: 'l10', term: 'Zoológico', category: 'lugares', difficulty: 'easy' },
  { id: 'l11', term: 'Parque de diversões', category: 'lugares', difficulty: 'easy' },
  // LUGARES — Médio
  { id: 'l12', term: 'Torre Eiffel', category: 'lugares', difficulty: 'medium' },
  { id: 'l13', term: 'Cristo Redentor', category: 'lugares', difficulty: 'medium' },
  { id: 'l14', term: 'Estátua da Liberdade', category: 'lugares', difficulty: 'medium' },
  { id: 'l15', term: 'Grande Muralha da China', category: 'lugares', difficulty: 'medium' },
  { id: 'l16', term: 'Coliseu', category: 'lugares', difficulty: 'medium' },
  { id: 'l17', term: 'Pirâmides do Egito', category: 'lugares', difficulty: 'medium' },
  { id: 'l18', term: 'Big Ben', category: 'lugares', difficulty: 'medium' },
  { id: 'l19', term: 'Carnaval do Rio', category: 'lugares', difficulty: 'medium' },
  { id: 'l20', term: 'Amazônia', category: 'lugares', difficulty: 'medium' },
  // LUGARES — Difícil
  { id: 'l21', term: 'Machu Picchu', category: 'lugares', difficulty: 'hard' },
  { id: 'l22', term: 'Taj Mahal', category: 'lugares', difficulty: 'hard' },
  { id: 'l23', term: 'Stonehenge', category: 'lugares', difficulty: 'hard' },
  { id: 'l24', term: 'Monte Everest', category: 'lugares', difficulty: 'hard' },
  { id: 'l25', term: 'Ilha de Páscoa', category: 'lugares', difficulty: 'hard' },

  // OBJETOS — Fácil
  { id: 'o01', term: 'Cadeira', category: 'objetos', difficulty: 'easy' },
  { id: 'o02', term: 'Bicicleta', category: 'objetos', difficulty: 'easy' },
  { id: 'o03', term: 'Guarda-chuva', category: 'objetos', difficulty: 'easy' },
  { id: 'o04', term: 'Geladeira', category: 'objetos', difficulty: 'easy' },
  { id: 'o05', term: 'Ventilador', category: 'objetos', difficulty: 'easy' },
  { id: 'o06', term: 'Celular', category: 'objetos', difficulty: 'easy' },
  { id: 'o07', term: 'Escova de dente', category: 'objetos', difficulty: 'easy' },
  { id: 'o08', term: 'Óculos', category: 'objetos', difficulty: 'easy' },
  { id: 'o09', term: 'Violão', category: 'objetos', difficulty: 'easy' },
  { id: 'o10', term: 'Balão', category: 'objetos', difficulty: 'easy' },
  { id: 'o11', term: 'Espelho', category: 'objetos', difficulty: 'easy' },
  // OBJETOS — Médio
  { id: 'o12', term: 'Liquidificador', category: 'objetos', difficulty: 'medium' },
  { id: 'o13', term: 'Telescópio', category: 'objetos', difficulty: 'medium' },
  { id: 'o14', term: 'Microscópio', category: 'objetos', difficulty: 'medium' },
  { id: 'o15', term: 'Tabuleiro de xadrez', category: 'objetos', difficulty: 'medium' },
  { id: 'o16', term: 'Submarino', category: 'objetos', difficulty: 'medium' },
  { id: 'o17', term: 'Guindaste', category: 'objetos', difficulty: 'medium' },
  { id: 'o18', term: 'Acordeão', category: 'objetos', difficulty: 'medium' },
  { id: 'o19', term: 'Balança', category: 'objetos', difficulty: 'medium' },
  { id: 'o20', term: 'Foguete', category: 'objetos', difficulty: 'medium' },
  // OBJETOS — Difícil
  { id: 'o21', term: 'Bússola', category: 'objetos', difficulty: 'hard' },
  { id: 'o22', term: 'Caleidoscópio', category: 'objetos', difficulty: 'hard' },
  { id: 'o23', term: 'Metrônomo', category: 'objetos', difficulty: 'hard' },
  { id: 'o24', term: 'Astrolábio', category: 'objetos', difficulty: 'hard' },
  { id: 'o25', term: 'Compasso de navegação', category: 'objetos', difficulty: 'hard' },

  // ABSTRATOS — Médio
  { id: 'ab01', term: 'Saudade', category: 'abstratos', difficulty: 'medium' },
  { id: 'ab02', term: 'Solidão', category: 'abstratos', difficulty: 'medium' },
  { id: 'ab03', term: 'Liberdade', category: 'abstratos', difficulty: 'medium' },
  { id: 'ab04', term: 'Coragem', category: 'abstratos', difficulty: 'medium' },
  { id: 'ab05', term: 'Inveja', category: 'abstratos', difficulty: 'medium' },
  { id: 'ab06', term: 'Medo', category: 'abstratos', difficulty: 'medium' },
  { id: 'ab07', term: 'Sonho', category: 'abstratos', difficulty: 'medium' },
  { id: 'ab08', term: 'Paz', category: 'abstratos', difficulty: 'medium' },
  { id: 'ab09', term: 'Tempo', category: 'abstratos', difficulty: 'medium' },
  { id: 'ab10', term: 'Amor', category: 'abstratos', difficulty: 'medium' },
  // ABSTRATOS — Difícil
  { id: 'ab11', term: 'Relatividade', category: 'abstratos', difficulty: 'hard' },
  { id: 'ab12', term: 'Democracia', category: 'abstratos', difficulty: 'hard' },
  { id: 'ab13', term: 'Inconsciente', category: 'abstratos', difficulty: 'hard' },
  { id: 'ab14', term: 'Caos', category: 'abstratos', difficulty: 'hard' },
  { id: 'ab15', term: 'Nirvana', category: 'abstratos', difficulty: 'hard' },
  { id: 'ab16', term: 'Entropia', category: 'abstratos', difficulty: 'hard' },
  { id: 'ab17', term: 'Destino', category: 'abstratos', difficulty: 'hard' },
  { id: 'ab18', term: 'Eternidade', category: 'abstratos', difficulty: 'hard' },
];

export function getRandomWord(
  categories: CategoryKey[],
  usedIds: string[],
  difficulty?: Difficulty
): Word | null {
  let pool = WORDS.filter(
    (w) => categories.includes(w.category) && !usedIds.includes(w.id)
  );
  if (difficulty) pool = pool.filter((w) => w.difficulty === difficulty);
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function getRandomModifier(): Modifier {
  return MODIFIERS[Math.floor(Math.random() * MODIFIERS.length)];
}
