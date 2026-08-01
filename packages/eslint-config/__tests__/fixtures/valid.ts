interface User {
  /**
   * User identifier.
   */
  id: number;
}

const user: User = { id: 1 };

const double = (n: number): number => {
  return n * 2;
};

export { user, double };
