<div class="section-content overflow-y <?php echo $CURRENT_SECTION === 'explore' ? 'active' : 'disabled'; ?>" data-section="sectionExplore">
    <div class="explore-container">
        <div class="explore-top">
            <div class="explore-control-group">
                <div class="selector-input" data-action="toggleSelector" id="explore-selector-button">
                    <div class="selected-value">
                        <div class="selected-value-icon left">
                            <span class="material-symbols-rounded">public</span>
                        </div>
                        <span class="selected-value-text">Explorar Municipios</span>
                    </div>
                    <div class="selected-value-icon">
                        <span class="material-symbols-rounded">arrow_drop_down</span>
                    </div>
                </div>
                <div class="module-content module-selector body-title disabled" data-module="moduleSelector" id="explore-selector-dropdown">
                     <div class="menu-content overflow-y">
                        <div class="menu-body overflow-y">
                            <div class="menu-list">
                                <div class="menu-link active" data-target-section="for-you" data-icon="public">
                                    <div class="menu-link-icon"><span class="material-symbols-rounded">public</span></div>
                                    <div class="menu-link-text"><span>Explorar Municipios</span></div>
                                </div>
                                <div class="menu-link" data-target-section="universities" data-icon="school">
                                    <div class="menu-link-icon"><span class="material-symbols-rounded">school</span></div>
                                    <div class="menu-link-text"><span>Explorar Universidades</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="explore-control-group disabled" id="university-filter-group">
                <div class="selector-input" data-action="toggleSelector" id="university-municipality-selector-button">
                    <div class="selected-value">
                        <div class="selected-value-icon left">
                            <span class="material-symbols-rounded">location_city</span>
                        </div>
                        <span class="selected-value-text">Todos los municipios</span>
                    </div>
                    <div class="selected-value-icon">
                        <span class="material-symbols-rounded">arrow_drop_down</span>
                    </div>
                </div>
                <div class="module-content module-selector body-title disabled" data-module="moduleSelector" id="university-municipality-selector-dropdown">
                     <div class="menu-content overflow-y">
                        <div class="menu-body overflow-y">
                            <div class="menu-list">
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>

        <div class="explore-bottom">
            <div class="explore-content-section active" data-section-id="for-you">
                <div class="community-cards-grid">
                    </div>
            </div>

            <div class="explore-content-section" data-section-id="universities">
                <div class="community-cards-grid">
                </div>
            </div>

        </div>
    </div>
</div>