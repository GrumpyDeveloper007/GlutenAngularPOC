import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { Topic, TopicGroup } from "../model/model";
import { Input } from '@angular/core';
import { HighlightPipe } from '../highlight.pipe';


@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [NgIf, HighlightPipe],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  @Input() selectedTopic: Topic | null = null;
  @Input() selectedTopicGroup: TopicGroup | null = null;
  facebookLink = 'about:blank';
}
