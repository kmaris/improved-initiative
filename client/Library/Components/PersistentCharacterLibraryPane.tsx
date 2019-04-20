import * as React from "react";

import {
  InitializeCharacter,
  PersistentCharacter
} from "../../../common/PersistentCharacter";
import { StatBlock } from "../../../common/StatBlock";
import { linkComponentToObservables } from "../../Combatant/linkComponentToObservables";
import { LibrariesCommander } from "../../Commands/LibrariesCommander";
import { StatBlockComponent } from "../../Components/StatBlock";
import { TextEnricher } from "../../TextEnricher/TextEnricher";
import { Listing } from "../Listing";
import { PersistentCharacterLibrary } from "../PersistentCharacterLibrary";
import { ListingGroupFn } from "./BuildListingTree";
import { LibraryPane } from "./LibraryPane";
import { ListingRow } from "./ListingRow";

export type PersistentCharacterLibraryPaneProps = {
  librariesCommander: LibrariesCommander;
  library: PersistentCharacterLibrary;
  statBlockTextEnricher: TextEnricher;
};

interface State {
  filter: string;
  previewedStatBlock: StatBlock;
  previewIconHovered: boolean;
  previewWindowHovered: boolean;
  previewPosition: { left: number; top: number };
}

export class PersistentCharacterLibraryPane extends React.Component<
  PersistentCharacterLibraryPaneProps,
  State
> {
  constructor(props: PersistentCharacterLibraryPaneProps) {
    super(props);
    this.state = {
      filter: "",
      previewedStatBlock: StatBlock.Default(),
      previewIconHovered: false,
      previewWindowHovered: false,
      previewPosition: { left: 0, top: 0 }
    };

    linkComponentToObservables(this);
  }

  private loadSavedStatBlock = (
    listing: Listing<PersistentCharacter>,
    hideOnAdd: boolean
  ) => {
    if (!this.props.librariesCommander.CanAddPersistentCharacter(listing)) {
      return false;
    }

    this.props.librariesCommander.AddPersistentCharacterFromListing(
      listing,
      hideOnAdd
    );

    return true;
  };

  private editStatBlock = (l: Listing<PersistentCharacter>) => {
    const subscription = l.Listing.subscribe(() => {
      this.forceUpdate(() => subscription.dispose());
    });
    this.props.librariesCommander.EditPersistentCharacterStatBlock(
      l.Listing().Id
    );
  };

  private createAndEditStatBlock = () => {
    const listing = this.props.librariesCommander.CreatePersistentCharacter();
    this.editStatBlock(listing);
  };

  private renderListingRow = (
    l: Listing<PersistentCharacter>,
    onPreview,
    onPreviewOut
  ) => (
    <ListingRow
      key={l.Listing().Id + l.Listing().Path + l.Listing().Name}
      name={l.Listing().Name}
      showCount
      onAdd={this.loadSavedStatBlock}
      onEdit={this.editStatBlock}
      onPreview={onPreview}
      onPreviewOut={onPreviewOut}
      listing={l}
    />
  );

  public render() {
    const listings = this.props.library.GetListings();

    return (
      <LibraryPane
        defaultItem={InitializeCharacter(StatBlock.Default())}
        listings={listings}
        renderListingRow={this.renderListingRow}
        groupByFunctions={this.groupingFunctions}
        hideLibraries={this.props.librariesCommander.HideLibraries}
        addNewItem={this.createAndEditStatBlock}
        renderPreview={character => (
          <StatBlockComponent
            statBlock={character.StatBlock}
            enricher={this.props.statBlockTextEnricher}
            displayMode="default"
          />
        )}
      />
    );
  }

  private groupingFunctions: ListingGroupFn[] = [
    l => ({
      key: l.Listing().Path
    })
  ];
}
