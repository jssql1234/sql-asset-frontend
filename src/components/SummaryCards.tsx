import React from "react";
import { Card } from "@/components/ui/components";

interface SummaryCardData {
  label: string;
  value: string | number;
}

interface SummaryCardsProps {
  data: SummaryCardData[];
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ data }) => {
  return (
    <div className="summary-cards">
      {data.map((item, index) => (
        <Card key={index}>
          <div className="summary-card-label">{item.label}</div>
          <div className="summary-card-value">{item.value}</div>
        </Card>
      ))}
    </div>
  );
};

export default SummaryCards;
