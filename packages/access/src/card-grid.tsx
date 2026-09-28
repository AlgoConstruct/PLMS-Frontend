import type { CardComponent } from "./registry";
import type { RawCard } from "./merge";

const SIZE: Record<RawCard["size"], string> = { small: "", medium: "md:col-span-2", wide: "md:col-span-3" };

/** Draws the cards the backends allowed, in their order; keys with no registered component are skipped. */
export function CardGrid({ cards, component }: { cards: RawCard[]; component: (key: string) => CardComponent | undefined }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {cards.map((card) => {
        const Card = component(card.key);
        if (!Card) return null;
        return (
          <div key={card.key} className={SIZE[card.size] ?? ""} data-card-key={card.key}>
            <Card />
          </div>
        );
      })}
    </div>
  );
}
