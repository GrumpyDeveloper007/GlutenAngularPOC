import { Component } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { TopicGroup } from "../_model/model";
import { Input } from '@angular/core';
import { HighlightPipe } from '../highlight.pipe';


@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [NgIf, NgFor, HighlightPipe],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  @Input() selectedTopicGroup: TopicGroup | null = null;
  facebookLink = 'about:blank';

  summary() {
    if (this.selectedTopicGroup == null) return "";
    if (this.selectedTopicGroup.topics == null) return 'Pin generated from Google maps :' + this.selectedTopicGroup.description;
    return 'AI Generated :' + this.selectedTopicGroup.description;
  }

  dateOnly(date: Date) {
    let currentDate = new Date(date);
    return currentDate.toDateString();
  }

}
