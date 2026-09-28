-- Sample content so the student view has something real to open,
-- and so the lecture page can demonstrate MathJax rendering end to end.

INSERT INTO modules (slug, title, description, published, order_index) VALUES
  ('propositional-logic', 'Propositional Logic', 'Statements, connectives, truth tables, and logical equivalence.', true, 1),
  ('set-theory', 'Set Theory', 'Sets, operations, and set identities.', true, 2),
  ('induction-draft', 'Mathematical Induction (draft)', 'Not yet ready for students.', false, 3);

-- Using dollar-quoting ($lesson$ ... $lesson$) for the lesson body so we can
-- write literal backslashes (needed for LaTeX commands like \neg, \land)
-- and literal apostrophes without any escaping gymnastics.
INSERT INTO lessons (module_id, title, content_md, video_url, order_index) VALUES
(
  (SELECT id FROM modules WHERE slug = 'propositional-logic'),
  'Logical Connectives and Truth Tables',
  $lesson$## Logical Connectives

A **proposition** is a statement that is either true or false, but not both. Given propositions $p$ and $q$, we build compound statements using connectives:

- Negation: $\neg p$
- Conjunction: $p \land q$
- Disjunction: $p \lor q$
- Implication: $p \rightarrow q$
- Biconditional: $p \leftrightarrow q$

### A key equivalence

An implication is logically equivalent to the disjunction of the negated hypothesis and the conclusion:

$$p \rightarrow q \;\equiv\; \neg p \lor q$$

You can verify this with a truth table, or algebraically using De Morgan's laws:

$$\neg(p \land \neg q) \equiv \neg p \lor \neg\neg q \equiv \neg p \lor q$$

### Quantifiers

For a predicate $P(x)$ over a domain $D$:

$$\forall x \in D,\; P(x) \qquad \text{and} \qquad \exists x \in D,\; P(x)$$

Their negations swap the quantifier and negate the predicate:

$$\neg\big(\forall x \in D,\, P(x)\big) \equiv \exists x \in D,\, \neg P(x)$$

_This lesson is seed content for the base layer build — replace with Prof. Lytle's materials._$lesson$,
  'https://www.youtube.com/embed/REPLACE_WITH_VIDEO_ID',
  1
);
